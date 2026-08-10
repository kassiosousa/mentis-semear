import { Copy, Download } from "lucide-react"
import { QRCodeCanvas } from "qrcode.react"
import * as React from "react"
import { toast } from "sonner"

import { copyToClipboard } from "@/lib/clipboard"
import { Button } from "@/presentation/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/presentation/components/ui/dialog"

const CANVAS_SIZE = 512
const DISPLAY_SIZE = 200

export interface QrTarget {
  title: string
  description?: string
  url: string
  fileName: string
}

interface QrCodeDialogProps {
  target: QrTarget | null
  onOpenChange: (open: boolean) => void
}

function QrCodeDialog({ target, onOpenChange }: QrCodeDialogProps) {
  const containerRef = React.useRef<HTMLDivElement>(null)

  const onCopy = async () => {
    if (target === null) return

    const copied = await copyToClipboard(target.url)

    if (copied) {
      toast.success("Link copiado.", { id: "qr-copy" })
      return
    }

    toast.error("Não foi possível copiar o link.", { id: "qr-copy" })
  }

  const onDownload = () => {
    const canvas = containerRef.current?.querySelector("canvas")

    if (canvas === null || canvas === undefined || target === null) {
      toast.error("Não foi possível gerar a imagem.", { id: "qr-download" })
      return
    }

    const link = document.createElement("a")
    link.href = canvas.toDataURL("image/png")
    link.download = `${target.fileName}.png`
    link.click()
  }

  return (
    <Dialog open={target !== null} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-sm">
        <DialogHeader>
          <DialogTitle>{target?.title ?? "QR Code"}</DialogTitle>
          {target?.description !== undefined && (
            <DialogDescription>{target.description}</DialogDescription>
          )}
        </DialogHeader>

        {target !== null && (
          <>
            <div ref={containerRef} className="flex justify-center">
              <div className="rounded-xl bg-white p-3 ring-1 ring-foreground/10">
                <QRCodeCanvas
                  value={target.url}
                  size={CANVAS_SIZE}
                  level="M"
                  marginSize={0}
                  bgColor="#FFFFFF"
                  fgColor="#14261A"
                  style={{ width: DISPLAY_SIZE, height: DISPLAY_SIZE }}
                />
              </div>
            </div>

            <p className="rounded-lg bg-muted px-3 py-2 text-center text-xs break-all text-muted-foreground">
              {target.url}
            </p>

            <div className="flex flex-col gap-2 sm:flex-row">
              <Button variant="outline" size="lg" onClick={onCopy} className="flex-1">
                <Copy className="size-4" />
                Copiar link
              </Button>
              <Button size="lg" onClick={onDownload} className="flex-1">
                <Download className="size-4" />
                Baixar PNG
              </Button>
            </div>
          </>
        )}
      </DialogContent>
    </Dialog>
  )
}

export { QrCodeDialog }
