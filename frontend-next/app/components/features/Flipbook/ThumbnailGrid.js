'use client';

import { useRef } from 'react';
import { Modal } from 'react-bootstrap';
import { motion } from 'framer-motion';
import { Swiper, SwiperSlide } from 'swiper/react';
import { Grid, Keyboard, Navigation, Virtual } from 'swiper/modules';
import 'swiper/css';
import 'swiper/css/grid';
import 'swiper/css/navigation';

/**
 * Page thumbnail grid. Uses Swiper's virtual+grid modules so the modal opens
 * fast even on flipbooks with hundreds of pages.
 *
 * @param {object} props
 * @param {boolean} props.show
 * @param {() => void} props.onHide
 * @param {object|null} props.flipbook
 * @param {number} props.currentIndex
 * @param {(index: number) => void} props.onJumpToPage
 * @returns {JSX.Element}
 */
export default function ThumbnailGrid({ show, onHide, flipbook, currentIndex, onJumpToPage }) {
  const swiperRef = useRef(null);

  if (!flipbook) return null;

  const handleSelect = (index) => {
    onJumpToPage(index);
    onHide();
  };

  return (
    <Modal show={show} onHide={onHide} size="xl" centered contentClassName="fb-grid-modal">
      <Modal.Header closeButton>
        <Modal.Title as="h2" className="h5 m-0">All pages</Modal.Title>
      </Modal.Header>
      <Modal.Body>
        <Swiper
          modules={[Grid, Keyboard, Navigation, Virtual]}
          onSwiper={(swiper) => {
            swiperRef.current = swiper;
            if (currentIndex > 0) {
              requestAnimationFrame(() => swiper.slideTo(currentIndex, 0));
            }
          }}
          grid={{ rows: 2, fill: 'row' }}
          spaceBetween={12}
          slidesPerView={2}
          breakpoints={{
            576: { slidesPerView: 3 },
            768: { slidesPerView: 4 },
            992: { slidesPerView: 5, grid: { rows: 2, fill: 'row' } },
            1400: { slidesPerView: 6, grid: { rows: 2, fill: 'row' } },
          }}
          navigation
          keyboard
          virtual
          className="fb-thumbs-swiper"
        >
          {flipbook.pages.map((page, index) => {
            const isActive = index === currentIndex;
            return (
              <SwiperSlide key={page.id || index} virtualIndex={index}>
                <motion.button
                  type="button"
                  className={`fb-thumb btn p-0 border ${isActive ? 'border-primary border-2' : 'border-secondary-subtle'}`}
                  onClick={() => handleSelect(index)}
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  aria-label={`Jump to ${page.title || `page ${index + 1}`}`}
                  aria-current={isActive ? 'true' : undefined}
                >
                  <img
                    src={page.image}
                    alt=""
                    width={300}
                    height={200}
                    loading="lazy"
                    decoding="async"
                    style={{ aspectRatio: '3 / 2', objectFit: 'cover', width: '100%' }}
                  />
                  <span className="d-block small text-center py-1 text-muted">
                    {index + 1}
                  </span>
                </motion.button>
              </SwiperSlide>
            );
          })}
        </Swiper>
      </Modal.Body>
    </Modal>
  );
}
