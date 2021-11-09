;; proposal

;; variables
(define-map proposals { proposal-id: uint } {
  id: uint,
  hash: (string-ascii 50),
  created-by: principal,
  group-id: uint,
  created-at: uint,
  finish-at: uint,
  token-name: (string-ascii 32),
  token-address: principal,
  total-votes: uint,
  options-number: uint
})
(define-map proposal-entries-by-group { group-id: uint } { proposal-ids: (list 300 uint) })
(define-data-var last-proposal-id uint u0)

;; errors
(define-constant err-user-not-an-admin-of-the-group (err u104))
(define-constant err-hash-too-short (err u105))
(define-constant err-group-does-not-exist (err u106))
(define-constant err-finish-block-should-be-in-the-future (err u107))
(define-constant err-proposal-already-owned (err u108))
(define-constant err-too-few-options (err u109))
(define-constant err-proposal-does-not-exist (err u110))
(define-constant err-too-late-to-vote (err u111))

;; getters
(define-read-only (get-proposal (id uint))
  (default-to
    { id: u0, hash: "", created-by: tx-sender, created-at: u0, group-id: u0, finish-at: u0, token-name: "", token-address: tx-sender, total-votes: u0, options-number: u0 }
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
(define-public (create-proposal (hash (string-ascii 50)) (group-id uint) (finish-at uint) (token-address principal) (token-name (string-ascii 32)) (options-number uint))
  (let
    (
      (new-proposal-id (+ (get-last-proposal-id) u1))
      (group (contract-call? .group get-group group-id))
      (admins (get admins group))
    )
    (asserts! (> finish-at block-height) err-finish-block-should-be-in-the-future)
    (asserts! (> options-number u1) err-too-few-options)
    (asserts! (> (len hash) u0) err-hash-too-short)
    (asserts! (not (is-eq (index-of admins tx-sender) none)) err-user-not-an-admin-of-the-group)
    (map-set
      proposals { proposal-id: new-proposal-id }
      {
        id: new-proposal-id,
        hash: hash,
        created-by: tx-sender,
        created-at: block-height,
        group-id: group-id,
        finish-at: finish-at,
        token-address: token-address,
        token-name: token-name,
        total-votes: u0,
        options-number: options-number
      }
    )
    (var-set last-proposal-id new-proposal-id)
    (try! (add-proposal-to-group-list group-id new-proposal-id))
    (ok true)
  )
)

(define-public (add-votes (proposal-id uint) (number-of-votes uint))
  (let
    (
      (proposal (get-proposal proposal-id))
      (new-number-of-votes (+ (get total-votes proposal) number-of-votes))
    )
    (asserts! (> (get id proposal) u0) err-proposal-does-not-exist)
    (asserts! (>= (get finish-at proposal) block-height) err-too-late-to-vote)
    (map-set proposals { proposal-id: proposal-id } (merge proposal { total-votes: new-number-of-votes }))
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
