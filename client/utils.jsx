export function isValidEmail(email) {
  const re = /^(([^<>()\[\]\.,;:\s@\"]+(\.[^<>()\[\]\.,;:\s@\"]+)*)|(\".+\"))@(([^<>()[\]\.,;:\s@\"]+\.)+[^<>()[\]\.,;:\s@\"]{2,})$/i;
  return re.test(email);
}

export function isValidPhone(phone) {
  const re = /^(\+\d{1,2}\s)?\(?\d{3}\)?[\s.-]?\d{3}[\s.-]?\d{4}$/;
  return re.test(phone);
}

export function getInlineUrl(url) {
  return `${__SERVERHOST__}:${__SERVERPORT__}/download/inline/${url}`;
}

export function getAttachmentUrl(url) {
  return `${__SERVERHOST__}:${__SERVERPORT__}/download/attachment/${url}`;
}

export function checkEnterEscapeKeyPress(e) {
  e = e || window.event;
  let isEscape = false;
  let isEnter = false;
  if ("key" in e) {
    isEscape = (e.key == "Escape" || e.key == "Esc");
    isEnter = (e.key == "Enter" || e.key == "Ent");
  } else {
    isEscape = (e.keyCode == 27);
    isEnter = (e.which == 13 || e.keyCode == 13);
  }
  return {isEscape, isEnter};
}

export function apiCall(payload, file, pureUpload) {
  return new Promise(function(resolve, reject) {
    let request=new XMLHttpRequest();
    if (pureUpload) {
      request.open("POST", `${__SERVERHOST__}:${__SERVERPORT__}/upload`, true);
    } else {
      request.open("POST", `${__SERVERHOST__}:${__SERVERPORT__}/graphql`, true);
    }
    let token = localStorage.getItem('token')
    if (token) {
      request.setRequestHeader("Authorization", `Bearer ${token}`)
    }
    if (file && file.size) {
      let newPayload = new FormData();
      newPayload.append('file', file);
      if (payload) newPayload.append('query', payload);
      request.send(newPayload);
    } else {
      request.setRequestHeader("Content-Type",
                             "application/graphql");    
      request.send(payload);
    }
    
    request.onreadystatechange = () => {
      if (request.readyState === 4) {
        resolve(request.responseText)
      }
    }
  })
}