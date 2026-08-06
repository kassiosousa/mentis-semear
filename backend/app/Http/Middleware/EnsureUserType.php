<?php

declare(strict_types=1);

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\Response;

/**
 * Restricts a route to authenticated users of one of the given types.
 * Usage: ->middleware('type:admin') or 'type:admin,facilitador'.
 */
final class EnsureUserType
{
    public function handle(Request $request, Closure $next, string ...$types): Response
    {
        $user = $request->user();

        if ($user === null || ! in_array($user->type->value, $types, true)) {
            abort(403, 'Acesso restrito.');
        }

        return $next($request);
    }
}
