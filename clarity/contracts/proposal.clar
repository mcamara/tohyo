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
  options-number: uint,
  votes: (list 10 uint)
})
(define-map proposal-votes-by-user { proposal-id: uint, user: principal } { votes: uint })
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
(define-constant err-too-many-options (err u112))
(define-constant err-user-do-not-have-that-many-tokens (err u113))
(define-constant err-option-does-not-exist (err u114))

;; getters
(define-read-only (get-proposal (id uint))
  (default-to
    { id: u0, hash: "", created-by: tx-sender, created-at: u0, group-id: u0, finish-at: u0, token-name: "", token-address: tx-sender, total-votes: u0, options-number: u0, votes: (list ) }
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

(define-read-only (get-votes-for-an-user-and-proposal (proposal-id uint) (user principal))
  (default-to { votes: u0 } (map-get? proposal-votes-by-user { proposal-id: proposal-id, user: user }))
)

(define-read-only (get-user-balance-for-proposal-token (proposal-id uint))
  ;; TODO
  ;; (let
  ;;   (
  ;;     (proposal (get-proposal proposal-id))
  ;;   )
    ;; (ft-get-balance .diko tx-sender)
    u1000000
  ;; )
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
    (asserts! (< options-number u10) err-too-many-options)
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
        options-number: options-number,
        votes: (list u0 u0 u0 u0 u0 u0 u0 u0 u0 u0)
      }
    )
    (var-set last-proposal-id new-proposal-id)
    (try! (add-proposal-to-group-list group-id new-proposal-id))
    (ok true)
  )
)

(define-public (vote (proposal-id uint) (option uint) (number-of-votes uint))
  (let
    (
      (proposal (get-proposal proposal-id))
      (user-balance (get-user-balance-for-proposal-token proposal-id))
      (new-number-of-votes-for-that-user (+ (get votes (get-votes-for-an-user-and-proposal proposal-id tx-sender)) number-of-votes))
      (new-number-of-votes (+ (get total-votes proposal) number-of-votes))
    )
    (asserts! (> (get id proposal) u0) err-proposal-does-not-exist)
    (asserts! (>= user-balance new-number-of-votes-for-that-user) err-user-do-not-have-that-many-tokens)
    (asserts! (> (get options-number proposal) option) err-option-does-not-exist)
    (asserts! (>= (get finish-at proposal) block-height) err-too-late-to-vote)
    (map-set proposal-votes-by-user { proposal-id: proposal-id, user: tx-sender } { votes: new-number-of-votes-for-that-user })
    (map-set proposals { proposal-id: proposal-id } ( merge proposal { total-votes: new-number-of-votes }))
    (new-votes-list proposal-id option number-of-votes)
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

;; I am sure this method can be done cleaner but didn't have time :D
(define-private (new-votes-list (proposal-id uint) (option uint) (number-of-votes uint))
  (let
    (
      (proposal (get-proposal proposal-id))
      (vote-list (get votes proposal))
      (value-0 (unwrap-panic (element-at vote-list u0)))
      (value-1 (unwrap-panic (element-at vote-list u1)))
      (value-2 (unwrap-panic (element-at vote-list u2)))
      (value-3 (unwrap-panic (element-at vote-list u3)))
      (value-4 (unwrap-panic (element-at vote-list u4)))
      (value-5 (unwrap-panic (element-at vote-list u5)))
      (value-6 (unwrap-panic (element-at vote-list u6)))
      (value-7 (unwrap-panic (element-at vote-list u7)))
      (value-8 (unwrap-panic (element-at vote-list u8)))
      (value-9 (unwrap-panic (element-at vote-list u9)))
      (new-list-of-votes (list
        (if (is-eq option u0) (+ value-0 number-of-votes) value-0)
        (if (is-eq option u1) (+ value-1 number-of-votes) value-1)
        (if (is-eq option u2) (+ value-2 number-of-votes) value-2)
        (if (is-eq option u3) (+ value-3 number-of-votes) value-3)
        (if (is-eq option u4) (+ value-4 number-of-votes) value-4)
        (if (is-eq option u5) (+ value-5 number-of-votes) value-5)
        (if (is-eq option u6) (+ value-6 number-of-votes) value-6)
        (if (is-eq option u7) (+ value-7 number-of-votes) value-7)
        (if (is-eq option u8) (+ value-8 number-of-votes) value-8)
        (if (is-eq option u9) (+ value-9 number-of-votes) value-9)
      ))
    )
    (map-set proposals { proposal-id: proposal-id } ( merge proposal { votes: new-list-of-votes }))
  )
)
