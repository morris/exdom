import { emit } from "./events";
import { getWindow } from "./util";

export function request(els, options, extraOptions) {
  const { fetch } = getWindow(els);

  const options_ = typeof options === "string" ? { url: options } : options;

  const req = {
    read: "auto",
    ...options_,
    ...extraOptions,
    headers: buildHeaders(els, options_, extraOptions),
    body: buildBody(els, options_, extraOptions)
  };

  emit(els, "request", req);

  let res, body;

  return fetch(req.url, req)
    .then(r => {
      res = r;

      emit(els, "res", { req, res });

      if (!req.read) return;

      return readResponse(els, res, req.read).then(b => {
        body = b;
        emit(els, "fullResponse", { req, res, body });
      });
    })
    .then(() => {
      if (res.status >= 400) {
        throw new Error(`Status code error ${res.status}`);
      }

      return { req, res, body };
    })
    .catch(err => {
      err.req = req;
      err.res = res;
      err.body = body;

      emit(els, "requestError", err);

      throw err;
    });
}

export function buildHeaders(context, options, extraOptions) {
  const { Headers, FormData } = getWindow(context);

  const req = { ...options, ...extraOptions };

  const headers = new Headers();

  if (req.read === "json" || req.read === "application/json") {
    headers.set("Accept", "application/json");
  }

  if (typeof req.body === "object" && !(req.body instanceof FormData)) {
    headers.set("Content-Type", "application/json");
  }

  Object.keys((options && options.headers) || {}).forEach(key => {
    headers.set(key, options.headers[key]);
  });

  Object.keys((extraOptions && extraOptions.headers) || {}).forEach(key => {
    headers.set(key, extraOptions.headers[key]);
  });

  return headers;
}

export function buildBody(context, options, extraOptions) {
  const { FormData } = getWindow(context);

  const body = (extraOptions && extraOptions.body) || (options && options.body);

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
