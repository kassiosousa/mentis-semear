<?php

declare(strict_types=1);

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Database\Eloquent\Relations\HasOne;
use Illuminate\Database\UniqueConstraintViolationException;
use Illuminate\Support\Str;
use RuntimeException;
use App\Enums\UserType;

class Workshop extends Model
{
    use HasFactory;

    /** Máximo de tentativas de gerar um token único antes de abortar a criação. */
    public const TOKEN_MAX_ATTEMPTS = 5;

    // token, checkin_link e assessment_link ficam fora do fillable: são
    // gerados no backend (evento creating) e nunca informados/alteráveis via API.
    /** @var list<string> */
    protected $fillable = [
        'company_id',
        'user_creator_id',
        'user_facilitator_id',
        'datetime',
        'address',
    ];

    protected static function booted(): void
    {
        // Token público + links de check-in/avaliação gerados automaticamente.
        // Vale para qualquer criação (API, seeders, testes, tinker). A rota de
        // criação usa createWithUniqueToken(), que ainda trata colisão de token.
        static::creating(function (Workshop $workshop): void {
            $workshop->token ??= Str::random(11);
            $workshop->checkin_link = self::checkinLinkFor($workshop->token);
            $workshop->assessment_link = self::assessmentLinkFor($workshop->token);
        });

        // Notifica os admins e, se houver, o facilitador atribuído.
        static::created(function (Workshop $workshop): void {
            Notification::forType(UserType::Admin, 'Nova oficina', "Oficina #{$workshop->id} criada.", 'workshop.created');
            Notification::forUserId($workshop->user_facilitator_id, 'Você foi atribuído a uma oficina', "Você é facilitador da oficina #{$workshop->id}.", 'workshop.assigned');
        });
    }

    /** URL pública de check-in derivada do token. */
    public static function checkinLinkFor(string $token): string
    {
        return self::publicLink('checkin', $token);
    }

    /** URL pública de avaliação (termômetro) derivada do token. */
    public static function assessmentLinkFor(string $token): string
    {
        return self::publicLink('avaliacao', $token);
    }

    private static function publicLink(string $path, string $token): string
    {
        // Aponta para o frontend (SPA), não para a API — em dev rodam em portas diferentes.
        return rtrim((string) config('app.frontend_url'), '/')."/{$path}/{$token}";
    }

    /**
     * Cria um workshop garantindo a unicidade do token.
     *
     * O token é aleatório (gerado no evento creating) e a coluna é UNIQUE; uma
     * colisão é improvável, porém possível. Se o INSERT violar a unicidade do
     * token, tenta de novo com outro token — até TOKEN_MAX_ATTEMPTS vezes.
     * Esgotadas as tentativas, aborta a criação lançando RuntimeException
     * (nenhum workshop é persistido).
     *
     * @param  array<string, mixed>  $attributes  Atributos preenchíveis (sem token/links).
     *
     * @throws RuntimeException  Se não obtiver um token único após as tentativas.
     */
    public static function createWithUniqueToken(array $attributes): self
    {
        for ($attempt = 1; $attempt <= self::TOKEN_MAX_ATTEMPTS; $attempt++) {
            try {
                // create() dispara o evento creating, que gera token + links.
                return self::create($attributes);
            } catch (UniqueConstraintViolationException $e) {
                // Só reprocessa se a colisão for do token; outra constraint deve propagar.
                if (! str_contains($e->getMessage(), 'token')) {
                    throw $e;
                }
                // Colisão de token — nova tentativa gera outro token.
            }
        }

        throw new RuntimeException(
            'Não foi possível gerar um token único para o workshop após '.self::TOKEN_MAX_ATTEMPTS.' tentativas.'
        );
    }

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
