<?php

declare(strict_types=1);

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class Assessment extends Model
{
    use HasFactory;

    /** @var list<string> */
    protected $fillable = ['workshop_id', 'score', 'suggestions'];

    /** @return array<string, string> */
    protected function casts(): array
    {
        return ['score' => 'integer'];
    }

    public function workshop(): BelongsTo
    {
        return $this->belongsTo(Workshop::class);
    }
}
