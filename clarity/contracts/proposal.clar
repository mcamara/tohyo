;; proposal

;; variables
(define-map proposals { proposal-id: uint } {
  id: uint,
  title: (string-ascii 100),
  created-by: principal,
  group-id: uint,
  created-at: uint,
  finish-at: uint,
  token: principal,
  total-votes: uint
})
(define-map proposal-entries-by-group { group-id: uint } { proposal-ids: (list 300 uint) })
(define-data-var last-proposal-id uint u0)

;; errors
(define-constant err-user-not-an-admin-of-the-group (err u104))
(define-constant err-title-too-short (err u105))
(define-constant err-group-does-not-exist (err u106))
(define-constant err-finish-block-should-be-in-the-future (err u107))
(define-constant err-proposal-already-owned (err u108))

;; getters
(define-read-only (get-proposal (id uint))
  (default-to
    { id: u0, title: "", created-by: tx-sender, created-at: u0, group-id: u0, finish-at: u0, token: .group, total-votes: u0 }
    (map-get? proposals { proposal-id: id })
  )
)

(define-read-only (get-last-proposal-id)
  (var-get last-proposal-id)
)

(define-read-only (get-proposal-ids-by-group (group-id uint))
  (unwrap! (map-get? proposal-entries-by-group { group-id: group-id }) (tuple (proposal-ids (list ) )))
)

(define-read-only (get-proposals-by-group (group-id uint))
  (let ((entries (get proposal-ids (get-proposal-ids-by-group group-id))))
    (map get-proposal entries)
  )
)

;; setters
(define-public (create-proposal (title (string-ascii 100)) (group-id uint) (finish-at uint) (token principal))
  (let
    (
      (new-proposal-id (+ (get-last-proposal-id) u1))
      (group (contract-call? .group get-group group-id))
      (admins (get admins group))
    )
    (asserts! (> finish-at block-height) err-finish-block-should-be-in-the-future)
    (asserts! (> (len title) u0) err-title-too-short)
    (asserts! (not (is-eq (index-of admins tx-sender) none)) err-user-not-an-admin-of-the-group)
    (map-set
      proposals { proposal-id: new-proposal-id }
      {
        id: new-proposal-id,
        title: title,
        created-by: tx-sender,
        created-at: block-height,
        group-id: group-id,
        finish-at: finish-at,
        token: token,
        total-votes: u0
      }
    )
    (var-set last-proposal-id new-proposal-id)
    (try! (add-proposal-to-group-list group-id new-proposal-id))
    (ok true)
  )
)

(define-private (add-proposal-to-group-list (group-id uint) (proposal-id uint))
  (let ((entries (get proposal-ids (get-proposal-ids-by-group group-id))))
    (asserts! (is-eq (index-of entries proposal-id) none) err-proposal-already-owned)
    (map-set proposal-entries-by-group { group-id: group-id }
      { proposal-ids: (unwrap-panic (as-max-len? (append entries proposal-id) u300)) }
    )
    (ok true)
  )
)
