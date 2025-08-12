<template>
    <div class="id-wrapper">
        <img src="/demo/images/bene_id_bg.png" class="id-bg-img" alt="Background" />
        <div class="id-card-pro">
            <div class="header">
                <img src="/demo/images/dswd.png" alt="DSWD Logo" class="id-logo" />
                <h3 class="id-title">Department of Social Welfare and Development</h3>
                <img src="/demo/images/bagongpilipinas.png" class="bagong-logo" />
            </div>
            <div class="right-section">
                <div class="body-flex">
                    <div class="left-section">
                        <img :src="getFaceUrl(client?.face_url)" alt="Profile Image" class="id-image" />
                    </div>
                    <div class="info">
                        <h3>BENEFICIARY IDENTIFICATION CARD</h3>
                        <p><b>Beneficiary ID:</b> {{ client?.beneficiary_id }}</p>
                        <p><b>Full Name:</b> {{ client?.first_name + ' ' + client?.middle_name + ' ' + client?.last_name }}</p>
                        <p><b>Birthdate:</b> {{ formatDate(client?.birth_date) }}</p>
                        <p v-if="showPSN"><b>PSN:</b> {{ client?.psn || '-' }}</p>
                    </div>
                </div>
                <div class="footer">
                    <div>
                        <strong>CONFIDENTIAL:</strong> For DSWD Use Only<br />
                        Valid for Verification of Eligibility to DSWD Programs<br />
                        <strong>Issued by DSWD on:</strong> {{ formatDate(issueDate) }}
                    </div>
                    <div>
                        <img v-if="qrCode" :src="qrCode" alt="QR Code" class="qr-image" />
                    </div>
                </div>
            </div>
        </div>
    </div>
</template>

<script setup>
import moment from 'moment';
const props = defineProps({
    client: { type: Object, required: true },
    qrCode: { type: String, default: '' },
    showPSN: { type: Boolean, default: true },
    issueDate: { type: [String, Date], default: () => new Date() }
});
const formatDate = (date) => (date ? moment(date).format('MMMM D, YYYY') : '');

// Helper to ensure the face_url is absolute
function getFaceUrl(face_url) {
    if (!face_url) return '';
    // If already absolute, return as is
    if (/^https?:\/\//.test(face_url)) return face_url;
    // Otherwise, prepend backend base URL (adjust as needed)
    const backend = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000/';
    // Remove leading slash if present
    return backend.replace(/\/$/, '') + '/' + face_url.replace(/^\//, '');
}
</script>

<!-- No style here, uses global/print CSS -->
<style scoped>
body {
    margin: 0 !important;
    padding: 0 !important;
    background: #fff !important;
}

@media print {
    body {
        margin: 0;
        padding: 0;
    }

    .id-wrapper {
        page-break-inside: avoid;
        margin: 0;
    }
}

.id-wrapper {
    position: relative;
    width: 650px;
    height: 450px;
    overflow: hidden;
    margin: 0 auto;
}

.id-bg-img {
    position: absolute;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    object-fit: cover;
    z-index: 0;
}

.id-card-pro {
    position: relative;
    z-index: 1;
    width: 100%;
    height: 100%;
    padding: 24px;
    box-sizing: border-box;
    font-family: 'Segoe UI', sans-serif;
    display: flex;
    flex-direction: column;
    justify-content: space-between;
}

.body-flex {
    display: flex;
    flex-direction: row;
    gap: 24px;
    margin: 0;
    padding: 0;
    align-items: flex-start;
}

.id-image {
    width: 150px;
    height: 180px;
    object-fit: cover;
    border-radius: 15px;
    border: 3px solid #224d81;
    margin-bottom: 12px;
}

.qr-image {
    width: 90px;
    height: 90px;
}

.info {
    flex: 1;
    margin-top: -1rem;
    padding: 0;
    font-size: 15px;
    text-align: left;
}

.info p {
    margin: 6px 0;
    font-size: 20px;
}
.info h2 {
    color: #1b2c5d;
}

.id-title {
    flex: 1;
    text-align: center;
    font-size: 18px;
    font-weight: bold;
    margin: 0;
    color: #1b2c5d;
}

.header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 0;
}

.header-left {
    display: flex;
    gap: 10px;
    align-items: center;
}

.id-logo {
    height: 75px;
    width: 140px;
}

.bagong-logo {
    height: 75px;
    width: 75px;
}

.footer {
    display: flex;
    text-align: left;
    justify-content: space-between;
    align-items: center;
    margin-top: 0;
    font-size: 13px;
    color: #333;
    border-top: 1px solid #ddd;
    padding-top: 10px;
}
</style>
