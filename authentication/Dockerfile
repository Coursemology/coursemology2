FROM quay.io/keycloak/keycloak:24.0.1 AS builder

# Enable health and metrics support
ENV KC_HEALTH_ENABLED=true
ENV KC_METRICS_ENABLED=true

# Configure a database vendor
ENV KC_DB=postgres

RUN /opt/keycloak/bin/kc.sh build

FROM quay.io/keycloak/keycloak:24.0.1
COPY --from=builder /opt/keycloak/ /opt/keycloak/

COPY ./singular-keycloak-database-federation/dist /opt/keycloak/providers
COPY ./theme/coursemology-keycloakify-keycloak-theme-8.0.1.jar /opt/keycloak/providers/coursemology-keycloakify-keycloak-theme-8.0.1.jar
COPY ./import/coursemology_realm.json /opt/keycloak/data/import/coursemology_realm.json

ENTRYPOINT ["/opt/keycloak/bin/kc.sh"]
