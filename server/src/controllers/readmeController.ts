/**
 * README Controller
 * Handles README generation, CRUD operations, and export tracking
 */
import { Request, Response, NextFunction } from 'express';
import { AppError, catchAsync } from '../utils/AppError';
import Readme from '../models/Readme';
import { getTemplate, getTemplatesForPlan, getAllTemplates } from '../services/templates';

/**
 * Generate README markdown (and optionally save)
 * POST /api/readmes/generate
 */
export const generateReadme = catchAsync(
  async (req: Request, res: Response, _next: NextFunction) => {
    const { input, templateId = 'modern', themeVariant = 'default' } = req.body;
    const user = req.user;

    // Get template
    const template = getTemplate(templateId);

    // Check plan access
    if (template.plan === 'pro' && (!user || user.plan !== 'pro')) {
      throw new AppError(
        'This template requires a Pro plan. Please upgrade to access premium templates.',
        403
      );
    }

    // Check export limits for authenticated users
    if (user && !user.canExport()) {
      throw new AppError(
        'You have reached your monthly export limit. Upgrade to Pro for unlimited exports.',
        429
      );
    }

    // Generate markdown using template
    const generatedMarkdown = template.generator(input);

    // If user is authenticated, save and track export
    let savedReadme = null;
    if (user) {
      savedReadme = await Readme.create({
        userId: user._id,
        title: input.projectName,
        input,
        generatedMarkdown,
        templateId,
        themeVariant,
      });

      // Increment export counter
      await user.incrementExports();
    }

    res.status(200).json({
      status: 'success',
      data: {
        markdown: generatedMarkdown,
        readmeId: savedReadme?._id || null,
        exportsRemaining: user
          ? user.plan === 'pro'
            ? 'unlimited'
            : Math.max(0, 5 - user.exportsUsedThisMonth)
          : null,
      },
    });
  }
);

/**
 * Preview README without saving (no auth required)
 * POST /api/readmes/preview
 */
export const previewReadme = catchAsync(
  async (req: Request, res: Response, _next: NextFunction) => {
    const { input, templateId = 'modern' } = req.body;

    const template = getTemplate(templateId);

    // For preview, allow free templates only without auth
    if (template.plan === 'pro' && (!req.user || req.user.plan !== 'pro')) {
      throw new AppError('Pro template preview requires a Pro plan.', 403);
    }

    const generatedMarkdown = template.generator(input);

    res.status(200).json({
      status: 'success',
      data: { markdown: generatedMarkdown },
    });
  }
);

/**
 * Get all READMEs for the logged-in user
 * GET /api/readmes
 */
export const getMyReadmes = catchAsync(
  async (req: Request, res: Response, _next: NextFunction) => {
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 10;
    const skip = (page - 1) * limit;

    const [readmes, total] = await Promise.all([
      Readme.find({ userId: req.user!._id })
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit)
        .select('-generatedMarkdown'), // Exclude full markdown in list
      Readme.countDocuments({ userId: req.user!._id }),
    ]);

    res.status(200).json({
      status: 'success',
      data: {
        readmes,
        pagination: {
          page,
          limit,
          total,
          pages: Math.ceil(total / limit),
        },
      },
    });
  }
);

/**
 * Get a single README by ID
 * GET /api/readmes/:id
 */
export const getReadme = catchAsync(
  async (req: Request, res: Response, next: NextFunction) => {
    const readme = await Readme.findById(req.params.id);

    if (!readme) {
      return next(new AppError('README not found', 404));
    }

    // Check ownership
    if (readme.userId.toString() !== req.user!._id.toString()) {
      return next(new AppError('Not authorized to view this README', 403));
    }

    res.status(200).json({
      status: 'success',
      data: { readme },
    });
  }
);

/**
 * Update a README
 * PATCH /api/readmes/:id
 */
export const updateReadme = catchAsync(
  async (req: Request, res: Response, next: NextFunction) => {
    const { input, templateId, themeVariant } = req.body;

    const readme = await Readme.findById(req.params.id);
    if (!readme) {
      return next(new AppError('README not found', 404));
    }

    // Check ownership
    if (readme.userId.toString() !== req.user!._id.toString()) {
      return next(new AppError('Not authorized to update this README', 403));
    }

    // Regenerate markdown if input changed
    if (input) {
      const template = getTemplate(templateId || readme.templateId);
      readme.input = input;
      readme.generatedMarkdown = template.generator(input);
      readme.title = input.projectName || readme.title;
    }

    if (templateId) readme.templateId = templateId;
    if (themeVariant) readme.themeVariant = themeVariant;

    await readme.save();

    res.status(200).json({
      status: 'success',
      data: { readme },
    });
  }
);

/**
 * Delete a README
 * DELETE /api/readmes/:id
 */
export const deleteReadme = catchAsync(
  async (req: Request, res: Response, next: NextFunction) => {
    const readme = await Readme.findById(req.params.id);

    if (!readme) {
      return next(new AppError('README not found', 404));
    }

    // Check ownership
    if (readme.userId.toString() !== req.user!._id.toString()) {
      return next(new AppError('Not authorized to delete this README', 403));
    }

    await Readme.findByIdAndDelete(req.params.id);

    res.status(200).json({
      status: 'success',
      message: 'README deleted successfully',
    });
  }
);

/**
 * Get available templates
 * GET /api/readmes/templates
 */
export const getTemplates = catchAsync(
  async (req: Request, res: Response, _next: NextFunction) => {
    const userPlan = req.user?.plan || 'free';
    const all = getAllTemplates();

    const templatesData = all.map((t) => ({
      id: t.id,
      name: t.name,
      description: t.description,
      plan: t.plan,
      isAccessible: userPlan === 'pro' || t.plan === 'free',
    }));

    res.status(200).json({
      status: 'success',
      data: { templates: templatesData },
    });
  }
);
