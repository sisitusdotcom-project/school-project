import os

css_path = r"e:\web-projects\MTSALMUHAMMADIYAH 1MLG.SCH.ID\assets\css\pages\karya-siswa.css"

css_content = '''
/* =========================================
   KARYA SISWA - PREMIUM STYLES
   ========================================= */

/* --- Category Tabs (4 Cards) --- */
.karya-categories-wrapper {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 1.5rem;
  margin-top: 1rem;
  margin-bottom: 3rem;
}
.karya-category-card {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  text-align: center;
  padding: 2rem 1rem;
  background: linear-gradient(145deg, #ffffff, #f9fbf9);
  border: 1px solid #eef2ef;
  border-radius: var(--radius-besar);
  box-shadow: 0 4px 15px rgba(0, 0, 0, 0.03);
  text-decoration: none;
  transition: all 0.3s cubic-bezier(0.25, 0.8, 0.25, 1);
  position: relative;
  overflow: hidden;
}
.karya-category-card::before {
  content: "";
  position: absolute;
  top: 0; left: 0; right: 0; height: 4px;
  background: var(--color-primary-green);
  transform: scaleX(0);
  transform-origin: left;
  transition: transform 0.4s ease;
}
.karya-category-card:hover {
  transform: translateY(-8px);
  box-shadow: 0 12px 24px rgba(34, 197, 94, 0.15);
  border-color: #d1fae5;
}
.karya-category-card:hover::before {
  transform: scaleX(1);
}
.karya-cat-icon {
  width: 60px;
  height: 60px;
  background: #ecfdf5;
  color: var(--color-primary-green);
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 1.8rem;
  margin-bottom: 1.25rem;
  transition: transform 0.4s ease, background 0.3s ease;
}
.karya-category-card:hover .karya-cat-icon {
  transform: scale(1.1) rotate(5deg);
  background: var(--color-primary-green);
  color: #fff;
}
.karya-cat-title {
  font-size: 1.15rem;
  font-weight: 700;
  color: var(--color-text-main);
  margin: 0;
}

/* --- Featured Karya (Unggulan) --- */
.karya-unggulan-wrapper {
  margin-bottom: 3rem;
}
.unggulan-card {
  display: flex;
  background: #fff;
  border-radius: var(--radius-besar);
  overflow: hidden;
  box-shadow: var(--shadow-md);
  border: 1px solid #eee;
  transition: transform 0.3s ease;
  text-decoration: none;
}
.unggulan-card:hover {
  transform: translateY(-3px);
  box-shadow: 0 10px 30px rgba(0,0,0,0.08);
}
.unggulan-img {
  width: 50%;
  position: relative;
}
.unggulan-img img {
  width: 100%;
  height: 100%;
  object-fit: cover;
  position: absolute;
  top: 0; left: 0;
}
.unggulan-content {
  width: 50%;
  padding: 3rem 2.5rem;
  display: flex;
  flex-direction: column;
  justify-content: center;
}
.unggulan-badge {
  display: inline-block;
  background: linear-gradient(90deg, #f59e0b, #fbbf24);
  color: #fff;
  padding: 0.3rem 0.8rem;
  border-radius: 20px;
  font-size: 0.8rem;
  font-weight: 700;
  text-transform: uppercase;
  margin-bottom: 1rem;
  align-self: flex-start;
  box-shadow: 0 2px 10px rgba(245, 158, 11, 0.3);
}
.unggulan-title {
  font-size: 1.8rem;
  font-weight: 800;
  color: var(--color-text-main);
  margin: 0 0 1rem 0;
  line-height: 1.3;
}
.karya-author-meta {
  display: flex;
  align-items: center;
  gap: 1rem;
  margin-bottom: 1.5rem;
}
.author-avatar {
  width: 45px;
  height: 45px;
  background: var(--color-surface-hover);
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  color: var(--color-primary-green);
  font-size: 1.4rem;
}
.author-info {
  display: flex;
  flex-direction: column;
}
.author-name {
  font-weight: 700;
  color: var(--color-text-main);
  font-size: 1rem;
}
.author-class {
  font-size: 0.85rem;
  color: var(--color-neutral-medium);
}

/* --- Recent Karya Grid (Grid Kartu) --- */
.karya-grid {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 1.5rem;
  margin-bottom: 3rem;
}
.karya-card {
  background: #fff;
  border-radius: var(--radius-sedang);
  overflow: hidden;
  box-shadow: 0 2px 8px rgba(0,0,0,0.03);
  border: 1px solid #eee;
  text-decoration: none;
  display: flex;
  flex-direction: column;
  transition: all 0.3s ease;
}
.karya-card:hover {
  transform: translateY(-5px);
  box-shadow: var(--shadow-md);
  border-color: #d1fae5;
}
.karya-card-img {
  position: relative;
  width: 100%;
  padding-top: 60%;
  overflow: hidden;
  background: #f5f5f5;
}
.karya-card-img img {
  position: absolute;
  top: 0; left: 0;
  width: 100%;
  height: 100%;
  object-fit: cover;
  transition: transform 0.5s ease;
}
.karya-card:hover .karya-card-img img {
  transform: scale(1.05);
}
.karya-card-category {
  position: absolute;
  top: 1rem;
  right: 1rem;
  background: rgba(255,255,255,0.95);
  color: var(--color-primary-green);
  font-weight: 700;
  font-size: 0.75rem;
  padding: 0.3rem 0.8rem;
  border-radius: 20px;
  box-shadow: 0 2px 10px rgba(0,0,0,0.1);
  backdrop-filter: blur(4px);
}
.karya-card-content {
  padding: 1.25rem;
  flex-grow: 1;
  display: flex;
  flex-direction: column;
}
.karya-card-title {
  font-size: 1.15rem;
  font-weight: 700;
  color: var(--color-text-main);
  margin: 0 0 1rem 0;
  line-height: 1.4;
}
.karya-card-footer {
  margin-top: auto;
  display: flex;
  justify-content: space-between;
  align-items: center;
  border-top: 1px solid #f0f0f0;
  padding-top: 1rem;
}
.karya-card-author {
  display: flex;
  align-items: center;
  gap: 0.5rem;
}
.karya-card-author-icon {
  color: var(--color-primary-green);
  font-size: 1.2rem;
}
.karya-card-author-text {
  display: flex;
  flex-direction: column;
}
.karya-card-author-name {
  font-size: 0.85rem;
  font-weight: 700;
  color: var(--color-text-main);
}
.karya-card-author-class {
  font-size: 0.75rem;
  color: var(--color-neutral-medium);
}
.karya-card-date {
  font-size: 0.75rem;
  color: var(--color-neutral-medium);
}

/* --- Prestasi Siswa List --- */
.prestasi-wrapper {
  background: #fff;
  border-radius: var(--radius-besar);
  box-shadow: 0 4px 15px rgba(0,0,0,0.03);
  border: 1px solid #eee;
  overflow: hidden;
}
.prestasi-list {
  display: flex;
  flex-direction: column;
}
.prestasi-item {
  display: flex;
  align-items: center;
  padding: 1.5rem;
  border-bottom: 1px solid #f5f5f5;
  transition: background 0.2s ease;
}
.prestasi-item:last-child {
  border-bottom: none;
}
.prestasi-item:hover {
  background: #fdfdfd;
}
.prestasi-icon-col {
  width: 50px;
  flex-shrink: 0;
}
.prestasi-icon-medal {
  width: 40px;
  height: 40px;
  background: #fffbeb;
  color: #f59e0b;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 1.4rem;
}
.prestasi-main-col {
  flex-grow: 1;
}
.prestasi-title {
  font-size: 1.1rem;
  font-weight: 700;
  color: var(--color-text-main);
  margin: 0 0 0.25rem 0;
}
.prestasi-student {
  font-size: 0.9rem;
  color: var(--color-neutral-medium);
  display: flex;
  align-items: center;
  gap: 0.5rem;
}
.prestasi-meta-col {
  text-align: right;
  flex-shrink: 0;
}
.prestasi-level {
  display: inline-block;
  background: #f3f4f6;
  color: #4b5563;
  padding: 0.2rem 0.6rem;
  border-radius: 4px;
  font-size: 0.75rem;
  font-weight: 700;
  margin-bottom: 0.3rem;
}
.prestasi-year {
  display: block;
  font-size: 0.8rem;
  color: var(--color-neutral-medium);
}

/* --- Detail Karya Page --- */
.detail-karya-header {
  margin-bottom: 2rem;
  border-bottom: 2px solid #eee;
  padding-bottom: 1.5rem;
}
.detail-karya-title {
  font-size: 2.2rem;
  font-weight: 800;
  color: var(--color-text-main);
  margin: 0 0 1rem 0;
  line-height: 1.3;
}
.detail-karya-badge-row {
  display: flex;
  gap: 0.75rem;
}
.karya-badge-cat {
  background: #ecfdf5;
  color: var(--color-primary-green);
  padding: 0.3rem 0.8rem;
  border-radius: 20px;
  font-size: 0.85rem;
  font-weight: 700;
}
.karya-badge-year {
  background: #f3f4f6;
  color: #4b5563;
  padding: 0.3rem 0.8rem;
  border-radius: 20px;
  font-size: 0.85rem;
  font-weight: 700;
}
.detail-karya-media {
  width: 100%;
  border-radius: var(--radius-besar);
  overflow: hidden;
  margin-bottom: 2.5rem;
  box-shadow: var(--shadow-md);
  background: #000;
}
.detail-karya-media img, .detail-karya-media video {
  width: 100%;
  height: auto;
  max-height: 600px;
  object-fit: contain;
  display: block;
}
.detail-karya-content-grid {
  display: grid;
  grid-template-columns: 2fr 1fr;
  gap: 3rem;
}
.detail-desc-box {
  font-size: 1.1rem;
  line-height: 1.8;
  color: var(--color-neutral-dark);
}
.detail-info-sidebar {
  background: #f9fbf9;
  padding: 2rem;
  border-radius: var(--radius-sedang);
  border: 1px solid #eef2ef;
}
.info-sidebar-block {
  margin-bottom: 1.5rem;
}
.info-sidebar-block:last-child {
  margin-bottom: 0;
}
.info-label {
  display: block;
  font-size: 0.85rem;
  color: var(--color-neutral-medium);
  text-transform: uppercase;
  letter-spacing: 1px;
  margin-bottom: 0.5rem;
}
.info-value {
  font-size: 1.05rem;
  font-weight: 700;
  color: var(--color-text-main);
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

/* --- Responsive Adjustments --- */
@media (max-width: 991px) {
  .karya-categories-wrapper { grid-template-columns: repeat(2, 1fr); }
  .unggulan-card { flex-direction: column; }
  .unggulan-img, .unggulan-content { width: 100%; }
  .unggulan-img { padding-top: 60%; }
  .unggulan-content { padding: 2rem; }
  .karya-grid { grid-template-columns: repeat(2, 1fr); }
  .detail-karya-content-grid { grid-template-columns: 1fr; gap: 2rem; }
}
@media (max-width: 576px) {
  .karya-categories-wrapper { grid-template-columns: repeat(2, 1fr); gap: 1rem; }
  .karya-category-card { padding: 1.5rem 0.5rem; }
  .karya-cat-icon { width: 45px; height: 45px; font-size: 1.4rem; margin-bottom: 1rem; }
  .karya-cat-title { font-size: 0.95rem; }
  .karya-grid { grid-template-columns: 1fr; gap: 1rem; }
  .unggulan-title { font-size: 1.4rem; }
  .unggulan-content { padding: 1.5rem; }
  .prestasi-item { flex-direction: column; align-items: flex-start; gap: 1rem; position: relative; }
  .prestasi-meta-col { text-align: left; }
  .detail-karya-title { font-size: 1.6rem; }
}
'''

with open(css_path, "w", encoding="utf8") as f:
    f.write(css_content)

print("Created karya-siswa.css")
