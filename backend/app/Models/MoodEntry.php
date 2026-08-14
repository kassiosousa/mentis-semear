<?php

declare(strict_types=1);

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

/**
 * Registro anônimo do termômetro emocional (por empresa).
 */
class MoodEntry extends Model
{
    use HasFactory;

    /** @var list<string> */
    protected $fillable = [
        'company_id',
        'sector_id',
        'mood',
    ];

    /** @return array<string, string> */
    protected function casts(): array
    {
        return ['mood' => 'integer'];
    }

    public function company(): BelongsTo
    {
        return $this->belongsTo(Company::class);
    }

    public function sector(): BelongsTo
    {
        return $this->belongsTo(Sector::class);
    }
}
