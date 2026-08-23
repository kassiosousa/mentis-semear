<?php

declare(strict_types=1);

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Requests\Notification\UpdateNotificationRequest;
use App\Models\Notification;
use App\Models\User;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use OpenApi\Attributes as OA;
use Symfony\Component\HttpFoundation\Response;

/**
 * Notificações do usuário autenticado (as dele + as do tipo dele).
 * A criação é interna (disparada por eventos); não há endpoint público de criação.
 */
final class NotificationController extends Controller
{
    #[OA\Get(
        path: '/api/notifications',
        summary: 'Lista as notificações do usuário autenticado (paginado)',
        security: [['bearerAuth' => []]],
        tags: ['Notifications'],
        parameters: [new OA\Parameter(name: 'status', in: 'query', required: false, description: 'Filtra por status', schema: new OA\Schema(type: 'string', enum: ['new', 'read']))],
        responses: [
            new OA\Response(response: 200, description: 'Lista paginada', content: new OA\JsonContent(properties: [
                new OA\Property(property: 'data', type: 'array', items: new OA\Items(ref: '#/components/schemas/Notification')),
                new OA\Property(property: 'current_page', type: 'integer'),
                new OA\Property(property: 'total', type: 'integer'),
            ])),
            new OA\Response(response: 401, description: 'Não autenticado'),
        ],
    )]
    public function index(Request $request): JsonResponse
    {
        $notifications = Notification::query()
            ->forUser($this->currentUser())
            ->when($request->filled('status'), fn ($q) => $q->where('status', $request->query('status')))
            ->orderByDesc('created_at')
            ->paginate(20);

        return response()->json($notifications);
    }

    #[OA\Get(
        path: '/api/notifications/unread-count',
        summary: 'Quantidade de notificações não lidas (para o badge)',
        security: [['bearerAuth' => []]],
        tags: ['Notifications'],
        responses: [
            new OA\Response(response: 200, description: 'Contagem', content: new OA\JsonContent(properties: [
                new OA\Property(property: 'data', properties: [new OA\Property(property: 'unread', type: 'integer', example: 3)], type: 'object'),
            ])),
            new OA\Response(response: 401, description: 'Não autenticado'),
        ],
    )]
    public function unreadCount(): JsonResponse
    {
        $unread = Notification::query()
            ->forUser($this->currentUser())
            ->where('status', Notification::STATUS_NEW)
            ->count();

        return response()->json(['data' => ['unread' => $unread]]);
    }

    #[OA\Post(
        path: '/api/notifications/read-all',
        summary: 'Marca todas as não lidas do usuário como lidas',
        security: [['bearerAuth' => []]],
        tags: ['Notifications'],
        responses: [
            new OA\Response(response: 200, description: 'Quantidade marcada', content: new OA\JsonContent(properties: [
                new OA\Property(property: 'data', properties: [new OA\Property(property: 'updated', type: 'integer', example: 3)], type: 'object'),
            ])),
            new OA\Response(response: 401, description: 'Não autenticado'),
        ],
    )]
    public function readAll(): JsonResponse
    {
        $updated = Notification::query()
            ->forUser($this->currentUser())
            ->where('status', Notification::STATUS_NEW)
            ->update(['status' => Notification::STATUS_READ, 'read_at' => now()]);

        return response()->json(['data' => ['updated' => $updated]]);
    }

    #[OA\Get(
        path: '/api/notifications/{notification}',
        summary: 'Detalha uma notificação',
        security: [['bearerAuth' => []]],
        tags: ['Notifications'],
        parameters: [new OA\Parameter(name: 'notification', in: 'path', required: true, schema: new OA\Schema(type: 'integer'))],
        responses: [
            new OA\Response(response: 200, description: 'Notificação', content: new OA\JsonContent(properties: [new OA\Property(property: 'data', ref: '#/components/schemas/Notification')])),
            new OA\Response(response: 401, description: 'Não autenticado'),
            new OA\Response(response: 403, description: 'Notificação de outro destinatário'),
            new OA\Response(response: 404, description: 'Não encontrada'),
        ],
    )]
    public function show(Notification $notification): JsonResponse
    {
        $this->ensureVisible($notification);

        return response()->json(['data' => $notification]);
    }

    #[OA\Patch(
        path: '/api/notifications/{notification}',
        summary: 'Atualiza o status (o front envia "read" quando o usuário lê)',
        security: [['bearerAuth' => []]],
        tags: ['Notifications'],
        parameters: [new OA\Parameter(name: 'notification', in: 'path', required: true, schema: new OA\Schema(type: 'integer'))],
        requestBody: new OA\RequestBody(required: true, content: new OA\JsonContent(
            required: ['status'],
            properties: [new OA\Property(property: 'status', type: 'string', enum: ['new', 'read'], example: 'read')],
        )),
        responses: [
            new OA\Response(response: 200, description: 'Atualizada', content: new OA\JsonContent(properties: [new OA\Property(property: 'data', ref: '#/components/schemas/Notification')])),
            new OA\Response(response: 401, description: 'Não autenticado'),
            new OA\Response(response: 403, description: 'Notificação de outro destinatário'),
            new OA\Response(response: 404, description: 'Não encontrada'),
            new OA\Response(response: 422, description: 'Status inválido'),
        ],
    )]
    public function update(UpdateNotificationRequest $request, Notification $notification): JsonResponse
    {
        $this->ensureVisible($notification);

        $status = $request->validated('status');
        $notification->status = $status;
        $notification->read_at = $status === Notification::STATUS_READ ? now() : null;
        $notification->save();

        return response()->json(['data' => $notification]);
    }

    #[OA\Delete(
        path: '/api/notifications/{notification}',
        summary: 'Remove uma notificação',
        security: [['bearerAuth' => []]],
        tags: ['Notifications'],
        parameters: [new OA\Parameter(name: 'notification', in: 'path', required: true, schema: new OA\Schema(type: 'integer'))],
        responses: [
            new OA\Response(response: 204, description: 'Removida'),
            new OA\Response(response: 401, description: 'Não autenticado'),
            new OA\Response(response: 403, description: 'Notificação de outro destinatário'),
            new OA\Response(response: 404, description: 'Não encontrada'),
        ],
    )]
    public function destroy(Notification $notification): Response
    {
        $this->ensureVisible($notification);

        $notification->delete();

        return response()->noContent();
    }

    private function currentUser(): User
    {
        /** @var User $user */
        $user = auth('api')->user();

        return $user;
    }

    /** A notificação precisa ser do usuário (user_id) ou do tipo dele (user_type). */
    private function ensureVisible(Notification $notification): void
    {
        $user = $this->currentUser();
        $visible = $notification->user_id === $user->id || $notification->user_type === $user->type->value;

        abort_unless($visible, 403, 'Notificação não pertence a você.');
    }
}
