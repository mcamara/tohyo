
;; group

;; variables
(define-map groups { group-id: uint } {
  id: uint,
  name: (string-ascii 30),
  owner: principal,
  created-at: uint,
  admins: (list 30 principal)
})
(define-map group-entries { account: principal } { group-ids: (list 50 uint) })
(define-data-var last-group-id uint u0)

;; errors
(define-constant err-owner-only (err u100))
(define-constant err-group-already-owned (err u101))
(define-constant err-name-too-short (err u102))
(define-constant err-too-many-admins (err u103))
(define-constant err-user-not-an-admin-of-the-group (err u104))

;; getters
(define-read-only (get-group (id uint))
  (default-to
    { id: u0, name: "", owner: tx-sender, created-at: u0, admins: (list ) }
    (map-get? groups { group-id: id })
  )
)

(define-read-only (get-last-group-id)
  (var-get last-group-id)
)

(define-read-only (get-group-ids-by-account (account principal))
  (unwrap! (map-get? group-entries { account: account }) (tuple (group-ids (list ) )))
)

(define-read-only (get-groups (account principal))
  (let ((entries (get group-ids (get-group-ids-by-account account))))
    (map get-group entries)
  )
)

;; setters
(define-public (create-group (name (string-ascii 30)))
  (let
    (
      (new-group-id (+ (get-last-group-id) u1))
      (requester tx-sender)
    )
    (asserts! (> (len name) u0) err-name-too-short)
    (map-set
      groups { group-id: new-group-id }
      { id: new-group-id, name: name, owner: requester, created-at: block-height, admins: (list requester) }
    )
    (try! (add-account-to-admins-list requester new-group-id))
    (var-set last-group-id new-group-id)
    (ok true)
  )
)

(define-private (add-account-to-admins-list (account principal) (group-id uint))
  (let ((entries (get group-ids (get-group-ids-by-account account))))
    (asserts! (is-eq (index-of entries group-id) none) err-group-already-owned)
    (map-set group-entries { account: account } { group-ids: (unwrap-panic (as-max-len? (append entries group-id) u50)) })
    (ok true)
  )
)

(define-public (add-admin-to-group (group-id uint) (new-admin principal))
  (let
    (
      (group (get-group group-id))
      (admins (get admins group))
    )
    (asserts! (is-eq (get owner group) tx-sender) err-owner-only)
    (asserts! (is-eq (index-of admins new-admin) none) err-group-already-owned)
    (asserts! (<= (len admins) u30) err-too-many-admins)

    (map-set groups { group-id: group-id }
      (merge group { admins: (unwrap-panic (as-max-len? (append admins new-admin) u30)) })
    )
    (try! (add-account-to-admins-list new-admin group-id))
    (ok true)
  )
)

(define-public (remove-admin-from-group (group-id uint) (old-admin principal))
  (let
    (
      (group (get-group group-id))
      (admins (get admins group))
      (user-groups (get group-ids (get-group-ids-by-account old-admin)))
      (admins-without-account (get result (fold not-equal-principal-closure admins { limit-value: old-admin, result: (list ) })))
      (new-group-list-for-account (get result (fold not-equal-number-closure user-groups { limit-value: group-id, result: (list ) })))
    )
    (asserts! (is-eq (get owner group) tx-sender) err-owner-only)
    (asserts! (not (is-eq (index-of admins old-admin) none)) err-user-not-an-admin-of-the-group)
    (asserts! (not (is-eq (index-of user-groups group-id) none)) err-user-not-an-admin-of-the-group)

    (map-set groups { group-id: group-id } (merge group { admins: admins-without-account }))
    (map-set group-entries { account: old-admin } { group-ids: new-group-list-for-account })
    (ok true)
  )
)

;; closures for fold
(define-private (not-equal-number-closure (element uint) (ctx { limit-value: uint, result: (list 50 uint) }))
  (if (not (is-eq element (get limit-value ctx)))
    {
      limit-value: (get limit-value ctx),
      result: (unwrap-panic (as-max-len? (append (get result ctx) element) u50))
    }
    ctx
  )
)

(define-private (not-equal-principal-closure (element principal) (ctx { limit-value: principal, result: (list 30 principal) }))
  (if (not (is-eq element (get limit-value ctx)))
    {
      limit-value: (get limit-value ctx),
      result: (unwrap-panic (as-max-len? (append (get result ctx) element) u30))
    }
    ctx
  )
)
