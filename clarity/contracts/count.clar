;; Counter contract

(define-map counters principal uint)
(define-data-var top-counter principal tx-sender)
(define-data-var top-count uint u0)
(define-data-var total-count uint u0)

;; (contract-call? 'ST1PQHQKV0RJXZFY1DGX8MNSNYVE3VGZJSRTPGZGM.count get-count 'ST1PQHQKV0RJXZFY1DGX8MNSNYVE3VGZJSRTPGZGM)
(define-read-only (get-count (who principal))
  (default-to u0 (map-get? counters who))
)

(define-read-only (get-total-count)
  (var-get total-count)
)

;; (contract-call? 'ST1PQHQKV0RJXZFY1DGX8MNSNYVE3VGZJSRTPGZGM.count get-top-counter)
(define-read-only (get-top-counter)
  {
    who: (var-get top-counter),
    count: (var-get top-count)
  }
)

;; (contract-call? 'ST1PQHQKV0RJXZFY1DGX8MNSNYVE3VGZJSRTPGZGM.count count-up)
(define-public (count-up)
  (let
    (
      (new-count (+ (get-count tx-sender) u1))
      (new-total-count (+ (var-get total-count) u1))
    )
    (map-set counters tx-sender new-count)
    (var-set total-count new-total-count)
    (and (> new-count (var-get top-count)) ;; if statement, 'and' executes everything inside
      (var-set top-count new-count)
      (var-set top-counter tx-sender)
    )
    (ok true)
  )
)
