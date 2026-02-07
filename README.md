# Resonance

Resonance is a modern React application deployed at:
https://resonance.my/

GitHub Repository:
https://github.com/Neuronus-Computing/resonance

## Overview
Resonance is a privacy-first digital ecosystem designed to provide secure communication, anonymous financial interactions, and an extensible suite of privacy-oriented tools. The platform brings together encrypted messaging, crypto wallet functionality, escrow services, and third-party integrations under a single unified environment.

This project represents a complete platform rather than a single application, focusing on anonymity, security, and user control.

---

## Platform Entry Points
- **Public Website:** https://resonance.my/
- **Web Application Portal:** https://web.resonance.my/login

The public website introduces the ecosystem, while the web application portal serves as the authenticated gateway to all core features and tools.

---

## Authentication (Seed‑Based)

Resonance uses a **seed-based authentication model** designed for privacy-first access and account recovery without relying on traditional username/password-only identity.

### What “seed-based” means
A **seed** (often shown to users as a **16 words seed phrase**) is treated as the **root secret** for a user identity.

Typical outcomes of seed-based authentication:
- Users can **recover access** using the seed (even if they lose a device)
- The platform can avoid storing sensitive password equivalents in a reversible form
- Identity can be represented as **Seed** rather than personal information

### How it works (high level flow)

  **Seed creation (first-time users)**
   - A new 16 words seed is generated.
   - The user is shown the seed phrase and must keep it safe.

## Core Features and Modules

### 1. Secure Messaging System
- End-to-end encrypted chat system
- Multi-layer message routing for anonymity
- Designed to prevent message traceability
- Focus on privacy-preserving communication rather than identity-based messaging

---

### 2. Cryptocurrency Wallet
- Integrated crypto wallet within the platform
- Designed for transfers, payments, and internal ecosystem usage
- Intended to work seamlessly with escrow and other platform services

---

### 3. Escrow System
- Built-in trustless escrow service
- Assisted dispute resolution
- Decisions based on submitted evidence rather than user identity
- Designed to support secure peer-to-peer transactions

---

## User Portal Capabilities
Once authenticated, users can:
- Access encrypted chats
- Manage crypto wallets and balances
- Use escrow services
- Access integrated tools
- Customize profiles and settings
---

## Security Philosophy
Resonance is built around the following principles:
- Privacy by default
- Minimal user identity exposure
- Encrypted data at rest and in transit
- Anonymity-first design choices
- Trustless and evidence-based systems

---
## Vision
Resonance aims to provide a secure digital environment where privacy, anonymity, and user autonomy are foundational—not optional.
