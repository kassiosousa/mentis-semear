<?php

declare(strict_types=1);

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Database\Eloquent\Relations\HasOne;

class Workshop extends Model
{
    use HasFactory;

    /** @var list<string> */
    protected $fillable = [
        'company_id',
        'user_creator_id',
        'user_facilitator_id',
        'datetime',
        'address',
        'checkin_link',
        'assessment_link',
    ];

    /** @return array<string, string> */
    protected function casts(): array
    {
        return ['datetime' => 'datetime'];
    }

    public function company(): BelongsTo
    {
        return $this->belongsTo(Company::class);
    }

    public function creator(): BelongsTo
    {
        return $this->belongsTo(User::class, 'user_creator_id');
    }

    public function facilitator(): BelongsTo
    {
        return $this->belongsTo(User::class, 'user_facilitator_id');
    }

    public function checkIns(): HasMany
    {
        return $this->hasMany(CheckIn::class);
    }

    public function assessments(): HasMany
    {
        return $this->hasMany(Assessment::class);
    }

    /** A workshop has a single diary (1:1). */
    public function diary(): HasOne
    {
        return $this->hasOne(Diary::class);
    }
}
