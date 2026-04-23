import { useEffect, useRef, useState } from 'react';
import { Image as KonvaImage } from 'react-konva';

interface CourtProps {
    width: number;
    courtType: 'half' | 'full';
}

// Image aspect ratio: 3171 x 5000 => width:height = 0.6342
const IMG_ASPECT = 3171 / 5000;

/** Returns the canvas height for a given width and court type */
export function getCourtHeight(width: number, courtType: 'half' | 'full'): number {
    const fullHeight = width / IMG_ASPECT;
    return courtType === 'half' ? fullHeight / 2 : fullHeight;
}

export default function Court({ width, courtType }: CourtProps) {
    const imageRef = useRef<HTMLImageElement | null>(null);
    const [image, setImage] = useState<HTMLImageElement | null>(null);

    useEffect(() => {
        const img = new window.Image();
        img.src = '/images/full_court.jpg';
        img.onload = () => {
            imageRef.current = img;
            setImage(img);
        };
    }, []);

    if (!image) return null;

    const fullHeight = width / IMG_ASPECT;

    if (courtType === 'half') {
        // Show only the top half of the image
        return (
            <KonvaImage
                image={image}
                x={0}
                y={0}
                width={width}
                height={fullHeight / 2}
                crop={{
                    x: 0,
                    y: 0,
                    width: image.naturalWidth,
                    height: image.naturalHeight / 2,
                }}
                listening={false}
            />
        );
    }

    return (
        <KonvaImage
            image={image}
            x={0}
            y={0}
            width={width}
            height={fullHeight}
            listening={false}
        />
    );
}
