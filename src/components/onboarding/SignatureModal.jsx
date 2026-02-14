import React, { useState, useRef, useEffect } from 'react';
import { X, PenTool, Type } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { cn } from '@/lib/utils';

export function SignatureModal({ isOpen, onClose, onSave, defaultTab = 'draw' }) {
    const [activeTab, setActiveTab] = useState(defaultTab);
    const [typedName, setTypedName] = useState('');
    const canvasRef = useRef(null);
    const [isDrawing, setIsDrawing] = useState(false);
    const [hasSignature, setHasSignature] = useState(false);

    // Reset state when modal opens
    useEffect(() => {
        if (isOpen) {
            setActiveTab(defaultTab);
            setTypedName('');
            setHasSignature(false);
            // Clear canvas if it exists
            setTimeout(() => clearCanvas(), 100);
        }
    }, [isOpen, defaultTab]);

    const startDrawing = (e) => {
        const canvas = canvasRef.current;
        if (!canvas) return;
        const ctx = canvas.getContext('2d');
        const rect = canvas.getBoundingClientRect();
        const x = (e.clientX || e.touches[0].clientX) - rect.left;
        const y = (e.clientY || e.touches[0].clientY) - rect.top;

        ctx.beginPath();
        ctx.moveTo(x, y);
        setIsDrawing(true);
        setHasSignature(true);
    };

    const draw = (e) => {
        if (!isDrawing) return;
        const canvas = canvasRef.current;
        if (!canvas) return;
        const ctx = canvas.getContext('2d');
        const rect = canvas.getBoundingClientRect();
        const x = (e.clientX || e.touches[0].clientX) - rect.left;
        const y = (e.clientY || e.touches[0].clientY) - rect.top;

        ctx.lineTo(x, y);
        ctx.stroke();
    };

    const stopDrawing = () => {
        setIsDrawing(false);
    };

    const clearCanvas = () => {
        const canvas = canvasRef.current;
        if (!canvas) return;
        const ctx = canvas.getContext('2d');
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        setHasSignature(false);
    };

    const handleSave = () => {
        if (activeTab === 'draw') {
            if (!hasSignature) return;
            const canvas = canvasRef.current;
            onSave({ type: 'drawn', data: canvas.toDataURL() });
        } else {
            if (!typedName.trim()) return;
            onSave({ type: 'typed', data: typedName });
        }
        onClose();
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50 animate-fade-in">
            <div className="bg-white rounded-lg w-full max-w-lg mx-4 relative shadow-xl flex flex-col max-h-[90vh]">

                {/* Header */}
                <div className="flex items-center justify-between p-4 border-b border-gray-200">
                    <h3 className="text-lg font-semibold text-[#212121]">Add Your e-Signature</h3>
                    <button onClick={onClose} className="text-gray-400 hover:text-gray-600">
                        <X className="w-5 h-5" />
                    </button>
                </div>

                {/* Tabs */}
                <div className="flex border-b border-gray-200">
                    <button
                        className={cn(
                            "flex-1 py-3 text-sm font-medium transition-colors relative",
                            activeTab === 'draw' ? "text-[#2874F0]" : "text-gray-500 hover:text-gray-700"
                        )}
                        onClick={() => setActiveTab('draw')}
                    >
                        Draw
                        {activeTab === 'draw' && (
                            <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-[#2874F0]" />
                        )}
                    </button>
                    <button
                        className={cn(
                            "flex-1 py-3 text-sm font-medium transition-colors relative",
                            activeTab === 'create' ? "text-[#2874F0]" : "text-gray-500 hover:text-gray-700"
                        )}
                        onClick={() => setActiveTab('create')}
                    >
                        Create
                        {activeTab === 'create' && (
                            <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-[#2874F0]" />
                        )}
                    </button>
                </div>

                {/* Content */}
                <div className="p-6 flex-1 overflow-auto">
                    {activeTab === 'draw' ? (
                        <div className="space-y-4">
                            <div className="border border-dashed border-gray-300 rounded-lg p-2 bg-gray-50 relative">
                                <canvas
                                    ref={canvasRef}
                                    width={450}
                                    height={200}
                                    className="w-full h-48 cursor-crosshair touch-none"
                                    onMouseDown={startDrawing}
                                    onMouseMove={draw}
                                    onMouseUp={stopDrawing}
                                    onMouseLeave={stopDrawing}
                                    onTouchStart={startDrawing}
                                    onTouchMove={draw}
                                    onTouchEnd={stopDrawing}
                                />
                                <button
                                    onClick={clearCanvas}
                                    className="absolute top-2 right-2 text-xs font-medium text-[#2874F0] hover:underline bg-white/80 px-2 py-1 rounded"
                                >
                                    Clear
                                </button>
                                {!hasSignature && !isDrawing && (
                                    <div className="absolute inset-0 flex items-center justify-center pointer-events-none text-gray-400">
                                        <span className="text-sm">Draw Signature</span>
                                    </div>
                                )}
                            </div>
                        </div>
                    ) : (
                        <div className="space-y-6">
                            <Input
                                label="Enter your name to create a signature *"
                                placeholder="Enter name"
                                value={typedName}
                                onChange={(e) => setTypedName(e.target.value)}
                            />

                            {typedName && (
                                <div className="p-8 bg-gray-50 rounded-lg text-center">
                                    <p className="text-4xl text-[#212121]" style={{ fontFamily: 'cursive' }}>
                                        {typedName}
                                    </p>
                                    <p className="text-xs text-gray-400 mt-4">Your signature will appear here</p>
                                </div>
                            )}
                        </div>
                    )}

                    <div className="mt-6 text-xs text-gray-500 text-center px-4">
                        By clicking on "Add", I understand that this is my electronic signature and is valid when used by me or my agent.
                    </div>
                </div>

                {/* Footer */}
                <div className="p-4 border-t border-gray-200 flex justify-end gap-3">
                    <Button variant="outline" onClick={onClose} className="w-24">
                        Cancel
                    </Button>
                    <Button
                        onClick={handleSave}
                        className="w-24 bg-[#2874F0] hover:bg-[#1f63d6]"
                        disabled={activeTab === 'draw' ? !hasSignature : !typedName.trim()}
                    >
                        Add
                    </Button>
                </div>
            </div>
        </div>
    );
}
