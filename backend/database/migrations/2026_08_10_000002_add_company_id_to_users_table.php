<?php

declare(strict_types=1);

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('users', function (Blueprint $table): void {
            // Vínculo com a empresa — obrigatório na regra de negócio apenas para
            // usuários do tipo "empresa" (validado na aplicação). Se a empresa for
            // removida, o vínculo é anulado (o usuário não é apagado).
            $table->foreignId('company_id')->nullable()->after('type')->constrained('companies')->nullOnDelete();
        });
    }

    public function down(): void
    {
        Schema::table('users', function (Blueprint $table): void {
            $table->dropConstrainedForeignId('company_id');
        });
    }
};
