'use client';

import { Dropdown } from 'react-bootstrap';

/**
 * Bottom toolbar: grid view, zoom controls, mute, search, fullscreen, more.
 * The "more" dropdown surfaces the secondary actions (text mode, share,
 * embed) so the bar stays uncluttered on narrow screens.
 *
 * @param {object} props
 * @param {() => void} props.onOpenGrid
 * @param {() => void} props.onZoomOut
 * @param {() => void} props.onZoomIn
 * @param {() => void} props.onResetZoom
 * @param {number} props.zoom Current zoom level (1 = 100%).
 * @param {boolean} props.muted
 * @param {() => void} props.onToggleMute
 * @param {() => void} props.onOpenSearch
 * @param {() => void} props.onToggleFullscreen
 * @param {() => void} props.onToggleTextMode
 * @param {() => void} props.onOpenEmbed
 * @param {() => void} props.onShare
 * @param {boolean} props.textMode
 * @returns {JSX.Element}
 */
export default function FlipbookToolbar(props) {
  const {
    onOpenGrid,
    onZoomOut,
    onZoomIn,
    onResetZoom,
    zoom,
    muted,
    onToggleMute,
    onOpenSearch,
    onToggleFullscreen,
    onToggleTextMode,
    onOpenEmbed,
    onShare,
    textMode,
  } = props;

  const zoomLabel = `${Math.round(zoom * 100)}%`;

  return (
    <div
      className="fb-toolbar d-flex flex-wrap align-items-center justify-content-between gap-2 p-2 bg-light border-top"
      role="toolbar"
      aria-label="Flipbook controls"
    >
      <div className="d-flex align-items-center gap-2 flex-wrap">
        <button
          type="button"
          className="btn btn-sm btn-outline-secondary"
          onClick={onOpenGrid}
          aria-label="Open page grid"
        >
          <i className="fa-solid fa-table-cells" aria-hidden="true" />
        </button>
        <div className="btn-group" role="group" aria-label="Zoom controls">
          <button
            type="button"
            className="btn btn-sm btn-outline-secondary"
            onClick={onZoomOut}
            aria-label="Zoom out"
          >
            <i className="fa-solid fa-minus" aria-hidden="true" />
          </button>
          <button
            type="button"
            className="btn btn-sm btn-outline-secondary"
            onClick={onZoomIn}
            aria-label="Zoom in"
          >
            <i className="fa-solid fa-plus" aria-hidden="true" />
          </button>
        </div>
        <button
          type="button"
          className="btn btn-sm btn-link p-0 text-muted"
          onClick={onResetZoom}
          aria-label={`Reset zoom (currently ${zoomLabel})`}
          title={`Reset zoom (currently ${zoomLabel})`}
          style={{ minWidth: '3.25rem' }}
        >
          {zoomLabel}
        </button>
        <button
          type="button"
          className={`btn btn-sm ${muted ? 'btn-secondary' : 'btn-outline-secondary'}`}
          onClick={onToggleMute}
          aria-label={muted ? 'Unmute sounds' : 'Mute sounds'}
          aria-pressed={muted}
        >
          <i className={`fa-solid ${muted ? 'fa-volume-xmark' : 'fa-volume-high'}`} aria-hidden="true" />
        </button>
        <button
          type="button"
          className="btn btn-sm btn-outline-secondary"
          onClick={onOpenSearch}
          aria-label="Search inside book"
        >
          <i className="fa-solid fa-magnifying-glass" aria-hidden="true" />
        </button>
        <button
          type="button"
          className="btn btn-sm btn-outline-secondary"
          onClick={onToggleFullscreen}
          aria-label="Toggle fullscreen"
        >
          <i className="fa-solid fa-expand" aria-hidden="true" />
        </button>
        <Dropdown align="end">
          <Dropdown.Toggle
            variant="outline-secondary"
            size="sm"
            id="fb-more-toggle"
            aria-label="More actions"
          >
            <i className="fa-solid fa-ellipsis-vertical" aria-hidden="true" />
          </Dropdown.Toggle>
          <Dropdown.Menu>
            <Dropdown.Item onClick={onToggleTextMode} active={textMode}>
              <i className="fa-solid fa-font me-2" aria-hidden="true" />
              {textMode ? 'Hide text version' : 'Show text version'}
            </Dropdown.Item>
            <Dropdown.Item onClick={onShare}>
              <i className="fa-solid fa-share-nodes me-2" aria-hidden="true" /> Share
            </Dropdown.Item>
            <Dropdown.Item onClick={onOpenEmbed}>
              <i className="fa-solid fa-code me-2" aria-hidden="true" /> Embed
            </Dropdown.Item>
          </Dropdown.Menu>
        </Dropdown>
      </div>
    </div>
  );
}
