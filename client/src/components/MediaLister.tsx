import FsLightbox, { SourceType } from 'fslightbox-react';
import { useState } from 'react';

interface MediaListerProps {
    title: string;
    sources: string[];
    thumbs: string[];
    type: SourceType;
}

interface LightboxControllerInterface {
    toggler: boolean;
    slide: number;
}

export default function MediaLister({ title, thumbs, sources, type }:MediaListerProps): JSX.Element {
    const [lightboxController, setLighboxController] = useState<LightboxControllerInterface>({ toggler: false, slide: 1 });
    const openLightboxSlide = (slide: number) => {
        setLighboxController({
            toggler: !lightboxController.toggler,
            slide: slide
        })
    }

    return (
        <>
            <h6 className="card-subtitle mb-2 text-muted mt-3">{title}</h6>

            <div className="container-fluid">
                <div className="row">
                    { sources.map( (source: string, index: number) => (
                        <div key={`${title.toLowerCase()}-${index}`} className="col-6 col-sm-6 col-md-4 col-lg-4 mb-4">
                            <img src={thumbs[index]} alt={`${title} ${index}`} className="img-fluid" onClick={() => openLightboxSlide(index + 1)} style={{ cursor: "pointer" }} />
                        </div>
                    ))}
                </div>
            </div>

            <FsLightbox
                toggler={lightboxController.toggler}
                sources={sources}
                slide={lightboxController.slide}
                type={type}
            />
        </>
    );
}