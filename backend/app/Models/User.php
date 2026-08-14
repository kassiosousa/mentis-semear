<?php

namespace App\Models;

use App\Enums\UserType;
use Database\Factories\UserFactory;
use Illuminate\Database\Eloquent\Attributes\Fillable;
use Illuminate\Database\Eloquent\Attributes\Hidden;
use Illuminate\Database\Eloquent\Concerns\HasUuids;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Foundation\Auth\User as Authenticatable;
use Illuminate\Notifications\Notifiable;
use PHPOpenSourceSaver\JWTAuth\Contracts\JWTSubject;

#[Fillable(['name', 'type', 'company_id', 'email', 'password'])]
#[Hidden(['password'])]
class User extends Authenticatable implements JWTSubject
{
    /** @use HasFactory<UserFactory> */
    use HasFactory, HasUuids, Notifiable;

    /** @var list<string> */
    protected $fillable = ['name', 'type', 'company_id', 'email', 'password'];

    /** @var list<string> */
    protected $hidden = ['password'];

    /**
     * @return array<string, string>
     */
    protected function casts(): array
    {
        return [
            'password' => 'hashed',
            'type' => UserType::class,
        ];
    }

    // ---- JWT (guard `api`) ----

    /** The identifier stored in the JWT `sub` claim (the user's UUID). */
    public function getJWTIdentifier(): mixed
    {
        return $this->getKey();
    }

    /** @return array<string, mixed> */
    public function getJWTCustomClaims(): array
    {
        return [];
    }

    // ---- Relationships ----

    /** Empresa vinculada (obrigatória para usuários do tipo "empresa"). */
    public function company(): BelongsTo
    {
        return $this->belongsTo(Company::class);
    }

    /** Workshops the user created. */
    public function createdWorkshops(): HasMany
    {
        return $this->hasMany(Workshop::class, 'user_creator_id');
    }

    /** Workshops the user facilitates. */
    public function facilitatedWorkshops(): HasMany
    {
        return $this->hasMany(Workshop::class, 'user_facilitator_id');
    }

    /** Diary entries authored by the user. */
    public function diaries(): HasMany
    {
        return $this->hasMany(Diary::class, 'user_creator_id');
    }
}
