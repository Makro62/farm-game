"use client";
export default function Modals() {
    return (
        <>
            <div className="rain-overlay"></div>
            <div id="toast-container"></div>

            <div className="modal-bg" id="modal">
                <div className="modal">
                    <h2 id="modal-title">Konfirmasi</h2>
                    <p id="modal-msg">Apakah Anda yakin?</p>
                    <div className="modal-btns">
                        <button className="act-btn" id="modal-cancel">Batal</button>
                        <button className="act-btn primary" id="modal-ok">Ya</button>
                    </div>
                </div>
            </div>

            <div className="modal-bg" id="prompt-modal">
                <div className="modal">
                    <h2 id="prompt-title">Masukkan Jumlah</h2>
                    <p id="prompt-msg">Berapa banyak?</p>
                    <input type="number" id="prompt-input" className="prompt-input" defaultValue="1" min="1" />
                    <div className="modal-btns">
                        <button className="act-btn" id="btn-prompt-cancel">Batal</button>
                        <button className="act-btn primary" id="prompt-ok">Beli</button>
                    </div>
                </div>
            </div>
        </>
    );
}
