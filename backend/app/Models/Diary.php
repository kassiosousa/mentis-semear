<?php

declare(strict_types=1);

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

class Diary extends Model
{
    use HasFactory;

    protected $table = 'diaries';

    /** @var list<string> */
    protected $fillable = ['workshop_id', 'user_creator_id', 'title', 'description', 'datetime'];

    /** @return array<string, string> */
    protected function casts(): array
    {
        return ['datetime' => 'datetime'];
    }

    public function workshop(): BelongsTo
    {
        return $this->belongsTo(Workshop::class);
    }

    public function creator(): BelongsTo
    {
        return $this->belongsTo(User::class, 'user_creator_id');
    }

    public function evidences(): HasMany
    {
        return $this->hasMany(DiaryEvidence::class);
    }
}
