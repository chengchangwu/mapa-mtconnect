#! /bin/bash
# MTCconnect script.

# Startup MTConnect Agent.
cd /home/debian/mapa-mtconnect/agent
agent debug agent.cfg &

# Startup Botnana-A2 Adapter.
cd /home/debian/mapa-mtconnect/adapter/
node mtcAdapter.js &
