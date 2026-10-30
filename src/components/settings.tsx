import * as React from 'react';
import { useState } from 'react';
import { FiSettings } from 'react-icons/fi';
import { Modal } from './modals';

const clockSettingKey = 'start-tab.showClock';
const backgroundStartColorSettingKey = 'start-tab.backgroundColor';
const backgroundEndColorSettingKey = 'start-tab.backgroundColorEnd';
const backgroundModeSettingKey = 'start-tab.backgroundMode';
const backgroundPhotoSettingKey = 'start-tab.backgroundPhoto';
const defaultBackgroundColor = '#a5a5a5';
const maxBackgroundPhotoSize = 2 * 1024 * 1024;
const supportedBackgroundPhotoTypes = new Set(['image/jpeg', 'image/png', 'image/webp', 'image/gif']);

const isHexColor = (color: string | null): color is string =>
    color !== null && /^#[0-9a-f]{6}$/i.test(color);

const isBackgroundPhoto = (photo: string | null): photo is string =>
    photo !== null && /^data:image\/(?:jpeg|png|webp|gif);base64,/i.test(photo);

type BackgroundMode = 'gradient' | 'photo';

export const useSettings = () => {
    const [showClock, setShowClock] = useState(() => {
        try {
            return window.localStorage.getItem(clockSettingKey) !== 'false';
        } catch {
            return true;
        }
    });
    const [backgroundStartColor, setBackgroundStartColor] = useState(() => {
        try {
            const savedColor = window.localStorage.getItem(backgroundStartColorSettingKey);
            return isHexColor(savedColor) ? savedColor : defaultBackgroundColor;
        } catch {
            return defaultBackgroundColor;
        }
    });
    const [backgroundEndColor, setBackgroundEndColor] = useState(() => {
        try {
            const savedColor = window.localStorage.getItem(backgroundEndColorSettingKey);
            return isHexColor(savedColor) ? savedColor : backgroundStartColor;
        } catch {
            return backgroundStartColor;
        }
    });
    const [backgroundPhoto, setBackgroundPhoto] = useState<string | null>(() => {
        try {
            const savedPhoto = window.localStorage.getItem(backgroundPhotoSettingKey);
            return isBackgroundPhoto(savedPhoto) ? savedPhoto : null;
        } catch {
            return null;
        }
    });
    const [backgroundMode, setBackgroundMode] = useState<BackgroundMode>(() => {
        try {
            const savedMode = window.localStorage.getItem(backgroundModeSettingKey);
            if (savedMode === 'gradient' || (savedMode === 'photo' && backgroundPhoto))
                return savedMode;
            return backgroundPhoto ? 'photo' : 'gradient';
        } catch {
            return backgroundPhoto ? 'photo' : 'gradient';
        }
    });
    const [backgroundPhotoError, setBackgroundPhotoError] = useState<string | null>(null);
    const photoReadRequest = React.useRef(0);

    React.useEffect(() => {
        document.body.style.backgroundColor = backgroundStartColor;
        document.body.style.backgroundImage = backgroundMode === 'photo' && backgroundPhoto
            ? `url("${backgroundPhoto}")`
            : `linear-gradient(135deg, ${backgroundStartColor}, ${backgroundEndColor})`;
        document.body.style.backgroundSize = 'cover';
        document.body.style.backgroundRepeat = 'no-repeat';
    }, [backgroundStartColor, backgroundEndColor, backgroundMode, backgroundPhoto]);

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
        handleClockVisibilityChange,
        handleBackgroundStartColorChange,
        handleBackgroundEndColorChange,
        handleBackgroundModeChange,
        handleBackgroundPhotoChange,
        handleRemoveBackgroundPhoto
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
    handleClockVisibilityChange,
    handleBackgroundStartColorChange,
    handleBackgroundEndColorChange,
    handleBackgroundModeChange,
    handleBackgroundPhotoChange,
    handleRemoveBackgroundPhoto
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
        </Modal>
    </>
);
