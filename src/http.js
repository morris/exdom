import { emit } from "./events";
import { getWindow } from "./util";

export function request(el, options, extra) {
  const { fetch } = getWindow(el);

  const options_ = typeof options === "string" ? { url: options } : options;

  const req = {
    read: "auto",
    ...options_,
    ...extra,
    headers: buildHeaders(el, options_, extra),
    body: buildBody(el, options_, extra)
  };

  emit(el, "request", req);

  let res, body;

  return fetch(req.url, req)
    .then(r => {
      res = r;

      emit(el, "response", { req, res });

      if (!req.read) return;

      return readResponse(el, res, req.read).then(b => {
        body = b;
        emit(el, "fullResponse", { req, res, body });
      });
    })
    .then(() => {
      if (!res.ok) {
        throw new Error(`Status code error ${res.status}`);
      }

      emit(el, "requestDone");

      return { req, res, body };
    })
    .catch(err => {
      err.req = req;
      err.res = res;
      err.body = body;

      emit(el, "requestError", err);
      emit(el, "requestDone");

      throw err;
    });
}

export function buildHeaders(context, options, extra) {
  const { Headers, FormData } = getWindow(context);

  const req = { ...options, ...extra };

  const headers = new Headers();

  if (req.read === "json" || req.read === "application/json") {
    headers.set("Accept", "application/json");
  }

  if (typeof req.body === "object" && !(req.body instanceof FormData)) {
    headers.set("Content-Type", "application/json");
  }

  if (options && options.headers) {
    for (const key of Object.keys(options.headers)) {
      headers.set(key, options.headers[key]);
    }
  }

  if (extra && extra.headers) {
    for (const key of Object.keys(extra.headers)) {
      headers.set(key, extra.headers[key]);
    }
  }

  return headers;
}

export function buildBody(context, options, extra) {
  const { FormData } = getWindow(context);

  const body = (extra && extra.body) || (options && options.body);

  if (typeof body === "object" && !(body instanceof FormData)) {
    return JSON.stringify(options.body);
  }

  return body;
}

export function readResponse(context, res, contentType) {
  const c =
    contentType === "auto"
      ? (res.headers.get("content-type") || "").toLowerCase()
      : contentType;

  switch (c.replace(/;.*$/, "")) {
    case "blob":
      return res.blob();
    case "formData":
    case "application/x-www-form-urlencoded":
      return res.formData();
    case "json":
    case "application/json":
      return res.json();
    case "text":
    case "application/javascript":
    case "text/css":
    case "text/csv":
    case "text/calendar":
    case "text/html":
    case "text/javascript":
    case "text/plain":
      return res.text();
    default:
      return res.arrayBuffer();
  }
}
