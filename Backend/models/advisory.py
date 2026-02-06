"""AI Advisory Pydantic models and prompt templates."""

from typing import Optional

from pydantic import BaseModel, Field


class CertRecommendation(BaseModel):
    """Model for a single certification recommendation."""

    certification_name: str
    vendor: str
    difficulty: str = Field(..., pattern="^(Beginner|Intermediate|Advanced)$")
    reason: str = Field(..., max_length=200)
    estimated_prep_time: str


class AdvisoryOutput(BaseModel):
    """Model for AI advisory output."""

    recommendations: list[CertRecommendation] = Field(default_factory=list, max_length=5)
    confidence: str = Field(default="low", pattern="^(high|medium|low)$")
    clarification_needed: Optional[str] = None


class AdvisoryRequest(BaseModel):
    """Model for advisory request."""

    skills: list[str] = Field(default_factory=list)
    current_certifications: list[str] = Field(default_factory=list)


# LangChain prompt templates
ADVISORY_SYSTEM_PROMPT = """You are a professional certification advisor for enterprise IT professionals.

## STRICT RULES
1. ONLY recommend real, industry-recognized certifications from vendors like:
   - AWS, Azure, Google Cloud, Oracle, Cisco, CompTIA, ISC2, ISACA, Salesforce, etc.
2. NEVER hallucinate fake certifications or policies.
3. Output MUST follow the exact JSON schema provided.
4. Base recommendations on skill gaps and career progression.
5. Maximum 5 recommendations per request.
6. Include certification difficulty level (Beginner/Intermediate/Advanced).

## OUTPUT SCHEMA (STRICT)
{
  "recommendations": [
    {
      "certification_name": "string",
      "vendor": "string",
      "difficulty": "Beginner|Intermediate|Advanced",
      "reason": "string (max 50 words)",
      "estimated_prep_time": "string (e.g., '2-3 months')"
    }
  ],
  "confidence": "high|medium|low",
  "clarification_needed": null | "string (question if skills are ambiguous)"
}
"""

ADVISORY_USER_TEMPLATE = """Based on the employee profile below, recommend relevant certifications.

## Current Skills
{skills}

## Existing Certifications
{current_certifications}

{format_instructions}
"""
