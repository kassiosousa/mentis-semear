<?php

declare(strict_types=1);

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\HasMany;

class Company extends Model
{
    use HasFactory;

    /** @var list<string> */
    protected $fillable = ['name', 'address', 'email'];

    /** Workshops hosted by this company. */
    public function workshops(): HasMany
    {
        return $this->hasMany(Workshop::class);
    }
}
