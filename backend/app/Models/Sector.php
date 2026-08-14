<?php

declare(strict_types=1);

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

class Sector extends Model
{
    use HasFactory;

    /** @var list<string> */
    protected $fillable = [
        'company_id',
        'name',
    ];

    /** Empresa dona do setor. */
    public function company(): BelongsTo
    {
        return $this->belongsTo(Company::class);
    }

    /** Check-ins que apontam para este setor. */
    public function checkIns(): HasMany
    {
        return $this->hasMany(CheckIn::class);
    }
}
