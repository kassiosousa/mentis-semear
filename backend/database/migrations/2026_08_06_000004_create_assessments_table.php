<?php

declare(strict_types=1);

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        // Avaliação anônima: várias respostas por workshop, sem vínculo com o participante.
        Schema::create('assessments', function (Blueprint $table): void {
            $table->id();
            $table->foreignId('workshop_id')->constrained('workshops')->cascadeOnDelete();
            $table->unsignedTinyInteger('score'); // 0..10 — faixa validada na camada de aplicação
            $table->string('suggestions', 500)->nullable();
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('assessments');
    }
};
