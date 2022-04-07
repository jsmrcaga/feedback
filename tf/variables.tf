variable cloudflare {
  type = object({
    email = string
    api_key = string
    api_token = string
    account_id = string
    zone_id = string
  })
}

variable github {
  type = object({
    token = string
  })
}

variable logsnag_token {
  type = string
}
