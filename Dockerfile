FROM node
LABEL repository="git@github.com:riddleandcode/r3c-did-resolver.git"

USER root

RUN mkdir "r3c-did-driver"
ADD LICENSE package.json package-lock.json README r3c-did-driver/
ADD src/ r3c-did-driver/src
RUN cd r3c-did-driver && npm install --prod --frozen-lockfile

EXPOSE 8080

ENTRYPOINT ["node", "/r3c-did-driver/src/app.js"]
