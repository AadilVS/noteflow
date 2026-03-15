import React from 'react';
import { X, FileText, Download, Maximize2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
} from '@/components/ui/dialog';
import { Note } from '@/types';

interface PDFViewerProps {
    note: Note | null;
    open: boolean;
    onOpenChange: (open: boolean) => void;
}

export const PDFViewer: React.FC<PDFViewerProps> = ({ note, open, onOpenChange }) => {
    if (!note) return null;

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="max-w-5xl h-[90vh] flex flex-col p-0 gap-0 overflow-hidden bg-background/95 backdrop-blur-md [&>button]:hidden">
                <DialogHeader className="p-4 border-b border-border flex flex-row items-center justify-between shadow-sm z-10">
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center text-primary">
                            <FileText className="w-5 h-5" />
                        </div>
                        <div>
                            <DialogTitle className="text-lg font-semibold">{note.title}</DialogTitle>
                            <p className="text-xs text-muted-foreground font-mono">
                                {note.fileName} • {(note.fileSize / 1024 / 1024).toFixed(2)} MB
                            </p>
                        </div>
                    </div>
                    <div className="flex items-center gap-2 pr-6">
                        <Button
                            variant="outline"
                            size="icon"
                            className="rounded-lg h-9 w-9"
                            onClick={() => window.open(note.pdfUrl, '_blank')}
                        >
                            <Maximize2 className="w-4 h-4" />
                        </Button>
                        <Button
                            variant="outline"
                            size="icon"
                            className="rounded-lg h-9 w-9"
                            asChild
                        >
                            <a href={note.pdfUrl} download={note.fileName}>
                                <Download className="w-4 h-4" />
                            </a>
                        </Button>
                        <Button
                            variant="outline"
                            size="icon"
                            className="text-muted-foreground hover:text-destructive rounded-lg h-9 w-9 ml-2"
                            onClick={() => onOpenChange(false)}
                        >
                            <X className="w-4 h-4" />
                        </Button>
                    </div>
                </DialogHeader>

                <div className="flex-1 bg-secondary/30 relative">
                    {note.pdfUrl ? (
                        <iframe
                            src={`${note.pdfUrl}#toolbar=0`}
                            className="w-full h-full border-0 absolute inset-0"
                            title={note.title}
                        />
                    ) : (
                        <div className="flex flex-col items-center justify-center h-full text-muted-foreground">
                            <FileText className="w-16 h-16 mb-4 opacity-20" />
                            <p>No preview available for this document.</p>
                        </div>
                    )}
                </div>
            </DialogContent>
        </Dialog>
    );
};
