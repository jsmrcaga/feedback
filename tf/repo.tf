module repo {
  source = "git@github.com:jsmrcaga/terraform-modules//github-repo?ref=v0.0.1"

  name = "feedback"
  visibility = "public"

  topics = ["feedback", "collector"]

  actions = {
    secrets = {
      CLOUDFLARE_ACCOUNT_ID = var.cloudflare.account_id 
      CLOUDFLARE_API_TOKEN = var.cloudflare.api_token
      CLOUDFLARE_ZONE_ID = var.cloudflare.zone_id
      LOGSNAG_TOKEN = var.logsnag_token
    }
  }
}
