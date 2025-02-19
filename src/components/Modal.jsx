const Modal = ({ isOpen, onClose, message }) => {
    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 bg-black bg-opacity-80 flex items-center justify-center z-50">
            <div className="bg-white rounded-lg p-8 max-w-md w-full mx-4">
                <div className="text-center">
                    <p className="text-gray-800 mb-6">{message}</p>
                    <button
                        onClick={onClose}
                        className="bg-green-500 text-white px-6 py-2 rounded-md hover:bg-green-600 transition-colors"
                    >
                        Close
                    </button>
                </div>
            </div>
        </div>
    );
};

export default Modal; 