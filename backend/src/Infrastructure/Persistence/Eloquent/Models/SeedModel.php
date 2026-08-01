<?php

declare(strict_types=1);

namespace Src\Infrastructure\Persistence\Eloquent\Models;

use Illuminate\Database\Eloquent\Model;

/**
 * Eloquent persistence model. Lives in Infrastructure and never leaks
 * into the Domain/Application layers — repositories map it to entities.
 *
 * @property int $id
 * @property string $title
 * @property string $content
 * @property \Illuminate\Support\Carbon $planted_at
 */
final class SeedModel extends Model
{
    protected $table = 'seeds';

    protected $fillable = [
        'title',
        'content',
        'planted_at',
    ];

    protected $casts = [
        'planted_at' => 'datetime',
    ];

    public $timestamps = true;
}
