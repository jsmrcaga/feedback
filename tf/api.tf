module api {
  source = "git@github.com:jsmrcaga/terraform-modules//cloudflare-worker?ref=v0.0.2"

  cloudflare = {
    default_zone_id = var.cloudflare.zone_id
  }

  script = {
    name = "feedback"
    content = file("../index.js")
    secrets = {

    }
  }

  kv_namespaces = ["FEEDBACK_DATABASE"]

  routes = [{
    # zone id comes from default
    pattern = "feedback.jocolina.com/*"
  }]

  dns_records = [{
    # zone id comes from default
    type = "CNAME"
    name = "feedback"
    value = "jocolina.com"
  }]
}
