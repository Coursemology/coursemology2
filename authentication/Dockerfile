FROM quay.io/keycloak/keycloak:24.0.1 as builder

# Enable health and metrics support
ENV KC_HEALTH_ENABLED=true
ENV KC_METRICS_ENABLED=true

# Configure a database vendor
ENV KC_DB=postgres

RUN /opt/keycloak/bin/kc.sh build

FROM quay.io/keycloak/keycloak:24.0.1
COPY --from=builder /opt/keycloak/ /opt/keycloak/

# change these values to point to a running postgres instance
ENV KC_DB=postgres
ENV KC_DB_URL=jdbc:postgresql://host.docker.internal/coursemology_keycloak
ENV KC_DB_USERNAME=postgres
# ENV KC_DB_PASSWORD=<DBPASSWORD>
ENV KC_HOSTNAME=lvh.me
ENTRYPOINT ["/opt/keycloak/bin/kc.sh"]
