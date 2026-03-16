<?php

namespace App\Providers;

use App\Models\ActivityLog;
use App\Models\User;
use App\Observers\UserObserver;
use Carbon\CarbonImmutable;
use Illuminate\Auth\Events\Login;
use Illuminate\Auth\Events\Logout;
use Illuminate\Support\Facades\Date;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Event;
use Illuminate\Support\Facades\Request;
use Illuminate\Support\ServiceProvider;
use Illuminate\Validation\Rules\Password;

class AppServiceProvider extends ServiceProvider
{
    /**
     * Register any application services.
     */
    public function register(): void
    {
        //
    }

    /**
     * Bootstrap any application services.
     */
    public function boot(): void
    {
        $this->configureDefaults();
        $this->configureObservers();
        $this->configureActivityLogging();
    }

    /**
     * Configure default behaviors for production-ready applications.
     */
    protected function configureDefaults(): void
    {
        Date::use(CarbonImmutable::class);

        DB::prohibitDestructiveCommands(
            app()->isProduction(),
        );

        Password::defaults(fn (): ?Password => app()->isProduction()
            ? Password::min(12)
                ->mixedCase()
                ->letters()
                ->numbers()
                ->symbols()
                ->uncompromised()
            : null,
        );
    }

    /**
     * Register model observers.
     */
    protected function configureObservers(): void
    {
        User::observe(UserObserver::class);
    }

    /**
     * Register activity logging for login and logout events.
     */
    protected function configureActivityLogging(): void
    {
        Event::listen(Login::class, function (Login $event) {
            /** @var User $user */
            $user = $event->user;

            ActivityLog::create([
                'user_id' => $user->id,
                'causer_id' => $user->id,
                'event' => 'login',
                'description' => "User '{$user->email}' logged in.",
                'ip_address' => Request::ip(),
                'user_agent' => Request::userAgent(),
            ]);
        });

        Event::listen(Logout::class, function (Logout $event) {
            /** @var User|null $user */
            $user = $event->user;

            if (! $user) {
                return;
            }

            ActivityLog::create([
                'user_id' => $user->id,
                'causer_id' => $user->id,
                'event' => 'logout',
                'description' => "User '{$user->email}' logged out.",
                'ip_address' => Request::ip(),
                'user_agent' => Request::userAgent(),
            ]);
        });
    }
}
