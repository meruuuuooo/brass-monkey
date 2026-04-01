<?php

namespace App\Http\Controllers\Client;

use App\Http\Controllers\Controller;
use App\Models\ServiceOrder;
use App\Services\ServiceOrderWorkflow;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class ServiceJobController extends Controller
{
    public function __construct(private readonly ServiceOrderWorkflow $workflow) {}

    public function index(Request $request): Response
    {
        $jobs = ServiceOrder::with(['service:id,name', 'assignee:id,name'])
            ->where('user_id', $request->user()->id)
            ->latest()
            ->paginate(15);

        return Inertia::render('client/service-jobs/index', [
            'jobs' => $jobs,
        ]);
    }

    public function show(Request $request, ServiceOrder $job): Response
    {
        if ($job->user_id !== $request->user()->id) {
            abort(403);
        }

        $job->load([
            'service:id,name',
            'assignee:id,name',
            'notes' => function ($query) {
                $query->with('author:id,name')->latest();
            },
            'review',
        ]);

        return Inertia::render('client/service-jobs/show', [
            'job' => $job,
        ]);
    }

    public function approveEstimate(Request $request, ServiceOrder $job): RedirectResponse
    {
        if ($job->user_id !== $request->user()->id) {
            abort(403);
        }

        if ($job->status === 'pending' && $job->estimated_cost > 0 && $request->user()->can('transition', [$job, 'accepted'])) {
            $job->update($this->workflow->transitionPayload($job, 'accepted'));

            $job->notes()->create([
                'type' => 'note',
                'content' => 'Customer approved the cost estimate of $'.number_format($job->estimated_cost, 2).'.',
                'created_by' => $request->user()->id,
            ]);

            return back()->with('success', 'Estimate approved successfully. We will begin work shortly.');
        }

        return back()->with('error', 'Estimate cannot be approved at this time.');
    }

    public function submitReview(Request $request, ServiceOrder $job): RedirectResponse
    {
        if ($job->user_id !== $request->user()->id || $job->status !== 'completed') {
            abort(403);
        }

        $validated = $request->validate([
            'rating' => 'required|integer|min:1|max:5',
            'comment' => 'nullable|string|max:1000',
        ]);

        $job->review()->updateOrCreate(
            ['service_order_id' => $job->id],
            [
                'user_id' => $request->user()->id,
                'rating' => $validated['rating'],
                'comment' => $validated['comment'],
            ]
        );

        return back()->with('success', 'Thank you for your feedback!');
    }
}
