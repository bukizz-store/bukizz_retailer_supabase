'use client';

import React from 'react';

export default function OrdersLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    return (
        <div className="animate-fade-in">
            {children}
        </div>
    );
}
