import { useState, useRef, useEffect } from 'react';
import './ContactForm.css';

export default function ContactForm({ t }) {
    const [status, setStatus] = useState('idle'); // idle, loading, success, error
    const [errors, setErrors] = useState({});
    
    // Custom Dropdown State
    const [isDropdownOpen, setIsDropdownOpen] = useState(false);
    const [selectedProjectType, setSelectedProjectType] = useState('');
    const dropdownRef = useRef(null);

    const projectTypes = [
        { value: 'content', label: t.types.content },
        { value: 'ecommerce', label: t.types.ecommerce },
        { value: 'animated', label: t.types.animated },
        { value: 'custom', label: t.types.custom }
    ];

    // Close dropdown on outside click
    useEffect(() => {
        const handleClickOutside = (event) => {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
                setIsDropdownOpen(false);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    const handleSubmit = async (e) => {
        e.preventDefault();
        
        const formData = new FormData(e.target);
        const data = Object.fromEntries(formData);
        data.projectType = selectedProjectType;
        
        // Frontend validation
        const newErrors = {};
        if (!data.name.trim()) newErrors.name = t.validation.nameReq;
        if (!data.email.trim() || !/^\S+@\S+\.\S+$/.test(data.email)) newErrors.email = t.validation.emailReq;
        if (!data.projectType) newErrors.projectType = t.validation.typeReq;
        if (!data.details.trim()) newErrors.details = t.validation.detailsReq;

        if (Object.keys(newErrors).length > 0) {
            setErrors(newErrors);
            return;
        }

        setErrors({});
        setStatus('loading');

        try {
            const res = await fetch('/api/contact', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(data),
            });

            const result = await res.json();

            if (!res.ok || !result.success) {
                throw new Error(result.error || 'Submission failed');
            }

            setStatus('success');
        } catch (err) {
            setStatus('error');
        }
    };

    if (status === 'success') {
        return (
            <div className="contact-success">
                <div className="success-icon">✓</div>
                <h3 className="success-title">{t.successTitle}</h3>
                <p className="success-message">{t.successDesc}</p>
            </div>
        );
    }

    const selectedLabel = projectTypes.find(opt => opt.value === selectedProjectType)?.label;

    return (
        <form className="contact-form" onSubmit={handleSubmit} noValidate>
            <div className="form-group">
                <label htmlFor="name" className="form-label">{t.nameLabel}</label>
                <input 
                    type="text" 
                    id="name" 
                    name="name" 
                    className={`form-input ${errors.name ? 'has-error' : ''}`}
                    placeholder={t.namePlaceholder}
                    disabled={status === 'loading'}
                />
                {errors.name && <span className="form-error">{errors.name}</span>}
            </div>

            <div className="form-group">
                <label htmlFor="email" className="form-label">{t.emailLabel}</label>
                <input 
                    type="email" 
                    id="email" 
                    name="email" 
                    className={`form-input ${errors.email ? 'has-error' : ''}`}
                    placeholder={t.emailPlaceholder}
                    disabled={status === 'loading'}
                />
                {errors.email && <span className="form-error">{errors.email}</span>}
            </div>

            <div className="form-group" ref={dropdownRef}>
                <label className="form-label">{t.projectTypeLabel}</label>
                <div className="custom-dropdown">
                    <button
                        type="button"
                        className={`form-select ${errors.projectType ? 'has-error' : ''} ${selectedProjectType ? 'has-value' : ''}`}
                        onClick={() => !status.loading && setIsDropdownOpen(!isDropdownOpen)}
                        disabled={status === 'loading'}
                    >
                        {selectedLabel || t.projectTypePlaceholder}
                        <span className="dropdown-chevron" style={{ transform: isDropdownOpen ? 'rotate(180deg)' : 'rotate(0)' }}>
                            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="rgba(225, 161, 64, 0.6)" width="20" height="20">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" />
                            </svg>
                        </span>
                    </button>
                    {isDropdownOpen && (
                        <div className="dropdown-menu">
                            {projectTypes.map(opt => (
                                <button
                                    key={opt.value}
                                    type="button"
                                    className={`dropdown-item ${opt.value === selectedProjectType ? 'is-selected' : ''}`}
                                    onClick={() => {
                                        setSelectedProjectType(opt.value);
                                        setIsDropdownOpen(false);
                                    }}
                                >
                                    {opt.label}
                                </button>
                            ))}
                        </div>
                    )}
                </div>
                {errors.projectType && <span className="form-error">{errors.projectType}</span>}
            </div>

            <div className="form-group">
                <label htmlFor="details" className="form-label">{t.detailsLabel}</label>
                <textarea 
                    id="details" 
                    name="details" 
                    className={`form-textarea ${errors.details ? 'has-error' : ''}`}
                    placeholder={t.detailsPlaceholder}
                    disabled={status === 'loading'}
                />
                {errors.details && <span className="form-error">{errors.details}</span>}
            </div>

            {status === 'error' && (
                <div className="form-global-error">{t.errorMsg}</div>
            )}

            <button 
                type="submit" 
                className={`btn btn-primary form-submit ${status === 'loading' ? 'is-loading' : ''}`}
                disabled={status === 'loading'}
            >
                {status === 'loading' ? t.submittingBtn : t.submitBtn}
            </button>
        </form>
    );
}
