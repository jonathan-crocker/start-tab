import * as React from 'react';
import { useState } from 'react';
import { FiSettings } from 'react-icons/fi';
import { Modal } from './modals';

const clockSettingKey = 'start-tab.showClock';
const backgroundStartColorSettingKey = 'start-tab.backgroundColor';
const backgroundEndColorSettingKey = 'start-tab.backgroundColorEnd';
const backgroundModeSettingKey = 'start-tab.backgroundMode';
const backgroundPhotoSettingKey = 'start-tab.backgroundPhoto';
const backgroundTextureSettingKey = 'start-tab.backgroundTexture';
const gradientDirectionSettingKey = 'start-tab.gradientDirection';
const defaultBackgroundColor = '#a5a5a5';
const maxBackgroundPhotoSize = 2 * 1024 * 1024;
const supportedBackgroundPhotoTypes = new Set(['image/jpeg', 'image/png', 'image/webp', 'image/gif']);

// Texture images are tiled PNGs with transparency, stored in src/public/textures.
const backgroundTextures = [
    { id: 'none', label: 'None', url: null },
    { id: 'dots', label: 'Dots', url: '/textures/dots.png' },
    { id: 'grid', label: 'Grid', url: '/textures/grid.png' },
    { id: 'stripes', label: 'Diagonal', url: '/textures/stripes.png' },
    { id: 'horizontal-stripes', label: 'Horizontal', url: '/textures/horizontal-stripes.png' },
    { id: 'vertical-stripes', label: 'Vertical', url: '/textures/vertical-stripes.png' },
    { id: 'rain-drops', label: 'Rain', url: '/textures/rain-drops.png' },
    { id: 'honeycomb', label: 'Honeycomb', url: '/textures/honeycomb.png' },
    { id: 'isometric-dots', label: 'Isometric', url: '/textures/isometric-dots.png' },
    { id: 'small-grid', label: 'Small grid', url: '/textures/small-grid.png' },
    { id: 'snowflakes', label: 'Snowflakes', url: '/textures/snowflakes.png' },
    { id: 'noise', label: 'Noise', url: '/textures/noise.png' }
] as const;

type BackgroundTextureId = typeof backgroundTextures[number]['id'];

const gradientDirections = [
    { id: 'diagonal', label: 'Diagonal', angle: 'to bottom right' },
    { id: 'top-bottom', label: 'Top to bottom', angle: '180deg' },
    { id: 'left-right', label: 'Left to right', angle: '90deg' }
] as const;

type GradientDirectionId = typeof gradientDirections[number]['id'];

const isGradientDirectionId = (id: string | null): id is GradientDirectionId =>
    gradientDirections.some(direction => direction.id === id);

const getGradientAngle = (id: GradientDirectionId) =>
    gradientDirections.find(direction => direction.id === id)?.angle ?? 'to bottom right';

const buildGradient = (angle: string, startColor: string, endColor: string) =>
    `linear-gradient(${angle}, ${startColor}, ${endColor})`;

const isHexColor = (color: string | null): color is string =>
    color !== null && /^#[0-9a-f]{6}$/i.test(color);

const isBackgroundPhoto = (photo: string | null): photo is string =>
    photo !== null && /^data:image\/(?:jpeg|png|webp|gif);base64,/i.test(photo);

const isBackgroundTextureId = (id: string | null): id is BackgroundTextureId =>
    backgroundTextures.some(texture => texture.id === id);

// The texture is the top layer, so it is drawn over the gradient or photo below it.
const buildBackgroundImage = (textureUrl: string | null, baseImage: string) =>
    `${textureUrl ? `url("${textureUrl}")` : 'none'}, ${baseImage}`;

type BackgroundMode = 'gradient' | 'photo';

// Each reader returns the saved value, or the default when storage is missing, invalid, or unavailable.
const readShowClock = () => {
    try {
        return window.localStorage.getItem(clockSettingKey) !== 'false';
    } catch {
        return true;
    }
};

const readBackgroundStartColor = () => {
    try {
        const savedColor = window.localStorage.getItem(backgroundStartColorSettingKey);
        return isHexColor(savedColor) ? savedColor : defaultBackgroundColor;
    } catch {
        return defaultBackgroundColor;
    }
};

const readBackgroundEndColor = (startColor: string) => {
    try {
        const savedColor = window.localStorage.getItem(backgroundEndColorSettingKey);
        return isHexColor(savedColor) ? savedColor : startColor;
    } catch {
        return startColor;
    }
};

const readBackgroundPhoto = (): string | null => {
    try {
        const savedPhoto = window.localStorage.getItem(backgroundPhotoSettingKey);
        return isBackgroundPhoto(savedPhoto) ? savedPhoto : null;
    } catch {
        return null;
    }
};

const readBackgroundMode = (photo: string | null): BackgroundMode => {
    const fallback: BackgroundMode = photo ? 'photo' : 'gradient';
    try {
        const savedMode = window.localStorage.getItem(backgroundModeSettingKey);
        if (savedMode === 'gradient' || (savedMode === 'photo' && photo))
            return savedMode;
        return fallback;
    } catch {
        return fallback;
    }
};

const readBackgroundTexture = (): BackgroundTextureId => {
    try {
        const savedTexture = window.localStorage.getItem(backgroundTextureSettingKey);
        return isBackgroundTextureId(savedTexture) ? savedTexture : 'none';
    } catch {
        return 'none';
    }
};

const readGradientDirection = (): GradientDirectionId => {
    try {
        const savedDirection = window.localStorage.getItem(gradientDirectionSettingKey);
        return isGradientDirectionId(savedDirection) ? savedDirection : 'diagonal';
    } catch {
        return 'diagonal';
    }
};

export const useSettings = () => {
    const [showClock, setShowClock] = useState(readShowClock);
    const [backgroundStartColor, setBackgroundStartColor] = useState(readBackgroundStartColor);
    const [backgroundEndColor, setBackgroundEndColor] = useState(() => readBackgroundEndColor(backgroundStartColor));
    const [backgroundPhoto, setBackgroundPhoto] = useState<string | null>(readBackgroundPhoto);
    const [backgroundMode, setBackgroundMode] = useState<BackgroundMode>(() => readBackgroundMode(backgroundPhoto));
    const [backgroundTexture, setBackgroundTexture] = useState<BackgroundTextureId>(readBackgroundTexture);
    const [gradientDirection, setGradientDirection] = useState<GradientDirectionId>(readGradientDirection);
    const [backgroundPhotoError, setBackgroundPhotoError] = useState<string | null>(null);
    const photoReadRequest = React.useRef(0);

    React.useEffect(() => {
        const textureUrl = backgroundTextures.find(texture => texture.id === backgroundTexture)?.url ?? null;
        const baseImage = backgroundMode === 'photo' && backgroundPhoto
            ? `url("${backgroundPhoto}")`
            : buildGradient(getGradientAngle(gradientDirection), backgroundStartColor, backgroundEndColor);

        document.body.style.backgroundColor = backgroundStartColor;
        document.body.style.backgroundImage = buildBackgroundImage(textureUrl, baseImage);
        document.body.style.backgroundSize = 'auto, cover';
        document.body.style.backgroundRepeat = 'repeat, no-repeat';
    }, [backgroundStartColor, backgroundEndColor, backgroundMode, backgroundPhoto, backgroundTexture, gradientDirection]);

    // Browsers fire "storage" in other pages of this extension when settings change there, so re-read them here.
    React.useEffect(() => {
        const handleStorageChange = (event: StorageEvent) => {
            if (event.storageArea !== window.localStorage)
                return;

            const startColor = readBackgroundStartColor();
            const photo = readBackgroundPhoto();

            setShowClock(readShowClock());
            setBackgroundStartColor(startColor);
            setBackgroundEndColor(readBackgroundEndColor(startColor));
            setBackgroundPhoto(photo);
            setBackgroundMode(readBackgroundMode(photo));
            setBackgroundTexture(readBackgroundTexture());
            setGradientDirection(readGradientDirection());
        };

        window.addEventListener('storage', handleStorageChange);
        return () => window.removeEventListener('storage', handleStorageChange);
    }, []);

    const handleClockVisibilityChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        const visible = event.currentTarget.checked;
        setShowClock(visible);

        try {
            window.localStorage.setItem(clockSettingKey, String(visible));
        } catch {
            // Keep the setting active for this page even if persistent storage is unavailable.
        }
    };

    const handleBackgroundStartColorChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        const color = event.currentTarget.value;
        setBackgroundStartColor(color);

        try {
            window.localStorage.setItem(backgroundStartColorSettingKey, color);
        } catch {
            // Keep the setting active for this page even if persistent storage is unavailable.
        }
    };

    const handleBackgroundEndColorChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        const color = event.currentTarget.value;
        setBackgroundEndColor(color);

        try {
            window.localStorage.setItem(backgroundEndColorSettingKey, color);
        } catch {
            // Keep the setting active for this page even if persistent storage is unavailable.
        }
    };

    const handleBackgroundModeChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        const mode = event.currentTarget.value;
        if (mode !== 'gradient' && mode !== 'photo')
            return;

        if (mode === 'gradient')
            photoReadRequest.current++;

        setBackgroundMode(mode);

        try {
            window.localStorage.setItem(backgroundModeSettingKey, mode);
        } catch {
            // Keep the setting active for this page even if persistent storage is unavailable.
        }
    };

    const handleBackgroundPhotoChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        const input = event.currentTarget;
        const file = input.files?.[0];
        input.value = '';

        if (!file)
            return;

        const request = ++photoReadRequest.current;

        if (!supportedBackgroundPhotoTypes.has(file.type)) {
            setBackgroundPhotoError('Choose a JPEG, PNG, WebP, or GIF image.');
            return;
        }

        if (file.size > maxBackgroundPhotoSize) {
            setBackgroundPhotoError('Choose an image smaller than 2 MB.');
            return;
        }

        const reader = new FileReader();
        reader.onload = () => {
            if (request !== photoReadRequest.current)
                return;

            if (typeof reader.result !== 'string') {
                setBackgroundPhotoError('Could not read that image. Please try another image.');
                return;
            }

            try {
                window.localStorage.setItem(backgroundPhotoSettingKey, reader.result);
                setBackgroundPhoto(reader.result);
                setBackgroundPhotoError(null);
                setBackgroundMode('photo');
                try {
                    window.localStorage.setItem(backgroundModeSettingKey, 'photo');
                } catch {
                    // A saved photo is selected automatically when no mode preference is available.
                }
            } catch {
                setBackgroundPhotoError('Could not save that image. Choose a smaller image.');
            }
        };
        reader.onerror = () => {
            if (request === photoReadRequest.current)
                setBackgroundPhotoError('Could not read that image. Please try another image.');
        };
        reader.readAsDataURL(file);
    };

    const handleBackgroundTextureChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        const textureId = event.currentTarget.value;
        if (!isBackgroundTextureId(textureId))
            return;

        setBackgroundTexture(textureId);

        try {
            window.localStorage.setItem(backgroundTextureSettingKey, textureId);
        } catch {
            // Keep the setting active for this page even if persistent storage is unavailable.
        }
    };

    const handleGradientDirectionChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        const directionId = event.currentTarget.value;
        if (!isGradientDirectionId(directionId))
            return;

        setGradientDirection(directionId);

        try {
            window.localStorage.setItem(gradientDirectionSettingKey, directionId);
        } catch {
            // Keep the setting active for this page even if persistent storage is unavailable.
        }
    };

    const handleRemoveBackgroundPhoto = () => {
        photoReadRequest.current++;

        try {
            window.localStorage.removeItem(backgroundPhotoSettingKey);
        } catch {
            setBackgroundPhotoError('Could not remove the saved background image.');
            return;
        }

        setBackgroundPhoto(null);
        setBackgroundPhotoError(null);
        setBackgroundMode('gradient');
        try {
            window.localStorage.setItem(backgroundModeSettingKey, 'gradient');
        } catch {
            // A missing saved photo defaults the background to the gradient.
        }
    };

    return {
        showClock,
        backgroundStartColor,
        backgroundEndColor,
        backgroundMode,
        backgroundPhoto,
        backgroundPhotoError,
        backgroundTexture,
        gradientDirection,
        handleClockVisibilityChange,
        handleBackgroundStartColorChange,
        handleBackgroundEndColorChange,
        handleBackgroundModeChange,
        handleBackgroundPhotoChange,
        handleRemoveBackgroundPhoto,
        handleBackgroundTextureChange,
        handleGradientDirectionChange
    };
};

type SettingsProps = ReturnType<typeof useSettings>;

export const Settings = ({
    showClock,
    backgroundStartColor,
    backgroundEndColor,
    backgroundMode,
    backgroundPhoto,
    backgroundPhotoError,
    backgroundTexture,
    gradientDirection,
    handleClockVisibilityChange,
    handleBackgroundStartColorChange,
    handleBackgroundEndColorChange,
    handleBackgroundModeChange,
    handleBackgroundPhotoChange,
    handleRemoveBackgroundPhoto,
    handleBackgroundTextureChange,
    handleGradientDirectionChange
}: SettingsProps) => (
    <>
        <button
            className="settings-button"
            type="button"
            data-bs-toggle="modal"
            data-bs-target="#settingsModal"
            aria-controls="settingsModal"
            aria-label="Settings"
            title="Settings">
            <FiSettings aria-hidden="true" size={20} />
        </button>
        <Modal
            id="settingsModal"
            labelledBy="settingsModalLabel"
            dialogClassName="settings-dialog"
            header={
                <>
                    <div>
                        <h5 className="modal-title" id="settingsModalLabel">Settings</h5>
                        <p className="small text-muted mb-0">Personalize your new tab</p>
                    </div>
                    <button
                        className="btn-close"
                        type="button"
                        data-bs-dismiss="modal"
                        aria-label="Close settings" />
                </>
            }>
            <div className="settings-clock-row">
                <div>
                    <label className="form-label mb-0" htmlFor="showClock">Clock and date</label>
                    <div className="small text-muted">Show the current time and date</div>
                </div>
                <div className="form-check form-switch mb-0">
                    <input
                        className="form-check-input"
                        type="checkbox"
                        role="switch"
                        id="showClock"
                        checked={showClock}
                        onChange={handleClockVisibilityChange} />
                </div>
            </div>
            <hr className="settings-divider" />
            <fieldset className="mb-3">
                <legend className="form-label">Background</legend>
                <div className="settings-mode-options">
                    <label className={`settings-mode-option${backgroundMode === 'gradient' ? ' active' : ''}`}>
                        <input
                            className="visually-hidden"
                            type="radio"
                            name="backgroundMode"
                            id="backgroundModeGradient"
                            value="gradient"
                            checked={backgroundMode === 'gradient'}
                            onChange={handleBackgroundModeChange} />
                        <span>Gradient</span>
                    </label>
                    <label className={`settings-mode-option${backgroundMode === 'photo' ? ' active' : ''}`}>
                        <input
                            className="visually-hidden"
                            type="radio"
                            name="backgroundMode"
                            id="backgroundModePhoto"
                            value="photo"
                            checked={backgroundMode === 'photo'}
                            onChange={handleBackgroundModeChange} />
                        <span>Image</span>
                    </label>
                </div>
            </fieldset>
            {backgroundMode === 'gradient' && (
                <div className="row g-3">
                    <div className="col-6">
                        <label className="form-label small text-muted" htmlFor="backgroundStartColor">Start colour</label>
                        <input
                            className="form-control form-control-color settings-color-input"
                            type="color"
                            id="backgroundStartColor"
                            value={backgroundStartColor}
                            onChange={handleBackgroundStartColorChange}
                            title="Choose gradient start colour" />
                    </div>
                    <div className="col-6">
                        <label className="form-label small text-muted" htmlFor="backgroundEndColor">End colour</label>
                        <input
                            className="form-control form-control-color settings-color-input"
                            type="color"
                            id="backgroundEndColor"
                            value={backgroundEndColor}
                            onChange={handleBackgroundEndColorChange}
                            title="Choose gradient end colour" />
                    </div>
                </div>
            )}
            {backgroundMode === 'gradient' && (
                <fieldset className="mt-3">
                    <legend className="form-label">Direction</legend>
                    <div className="settings-texture-options">
                        {gradientDirections.map(direction => {
                            const checked = gradientDirection === direction.id;
                            const previewStyle: React.CSSProperties = {
                                backgroundImage: buildGradient(direction.angle, backgroundStartColor, backgroundEndColor)
                            };

                            return (
                                <label
                                    key={direction.id}
                                    className={`settings-texture-option${checked ? ' active' : ''}`}>
                                    <input
                                        className="visually-hidden"
                                        type="radio"
                                        name="gradientDirection"
                                        value={direction.id}
                                        checked={checked}
                                        onChange={handleGradientDirectionChange} />
                                    <span className="settings-texture-preview" style={previewStyle} aria-hidden="true" />
                                    <span className="small">{direction.label}</span>
                                </label>
                            );
                        })}
                    </div>
                </fieldset>
            )}
            {backgroundMode === 'photo' && (
                <div className="settings-photo-picker">
                    <label className="form-label" htmlFor="backgroundPhoto">Choose an image</label>
                    <input
                        className="form-control form-control-sm"
                        type="file"
                        id="backgroundPhoto"
                        accept="image/jpeg,image/png,image/webp,image/gif"
                        aria-describedby="backgroundPhotoHelp"
                        onChange={handleBackgroundPhotoChange} />
                    <div className="form-text" id="backgroundPhotoHelp">
                        JPEG, PNG, WebP, or GIF · Up to 2 MB · Stored locally
                    </div>
                    {backgroundPhoto && (
                        <div className="settings-photo-actions">
                            <span className="small text-muted">Image selected</span>
                            <button
                                className="btn btn-sm btn-link p-0"
                                type="button"
                                onClick={handleRemoveBackgroundPhoto}>
                                Remove
                            </button>
                        </div>
                    )}
                    {backgroundPhotoError && <div className="small text-danger mt-2" role="alert">{backgroundPhotoError}</div>}
                </div>
            )}
            <hr className="settings-divider" />
            <fieldset>
                <legend className="form-label">Texture</legend>
                <div className="settings-texture-options">
                    {backgroundTextures.map(texture => {
                        const checked = backgroundTexture === texture.id;
                        const previewStyle: React.CSSProperties = {
                            backgroundImage: buildBackgroundImage(
                                texture.url,
                                buildGradient(getGradientAngle(gradientDirection), backgroundStartColor, backgroundEndColor)
                            ),
                            backgroundSize: 'auto, cover',
                            backgroundRepeat: 'repeat, no-repeat'
                        };

                        return (
                            <label
                                key={texture.id}
                                className={`settings-texture-option${checked ? ' active' : ''}`}>
                                <input
                                    className="visually-hidden"
                                    type="radio"
                                    name="backgroundTexture"
                                    value={texture.id}
                                    checked={checked}
                                    onChange={handleBackgroundTextureChange} />
                                <span className="settings-texture-preview" style={previewStyle} aria-hidden="true" />
                                <span className="small">{texture.label}</span>
                            </label>
                        );
                    })}
                </div>
            </fieldset>
        </Modal>
    </>
);
