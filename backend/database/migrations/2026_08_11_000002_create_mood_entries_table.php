<?php

declare(strict_types=1);

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        // Termômetro emocional (anônimo) — por empresa, com setor e humor 1..5.
        Schema::create('mood_entries', function (Blueprint $table): void {
            $table->id();
            $table->foreignId('company_id')->constrained('companies')->cascadeOnDelete();
            // Setor obrigatório no envio (validado na aplicação); nullable no banco para
            // preservar o histórico caso o setor seja removido (nullOnDelete).
            $table->foreignId('sector_id')->nullable()->constrained('sectors')->nullOnDelete();
            $table->unsignedTinyInteger('mood'); // 1 (muito mal) .. 5 (muito bem)
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('mood_entries');
    }
};
