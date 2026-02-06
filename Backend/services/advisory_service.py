"""AI Advisory service using LangChain."""

from langchain_core.output_parsers import PydanticOutputParser
from langchain_core.prompts import ChatPromptTemplate
from langchain_openai import ChatOpenAI

from config import get_settings
from models.advisory import (
    AdvisoryOutput,
    AdvisoryRequest,
    ADVISORY_SYSTEM_PROMPT,
    ADVISORY_USER_TEMPLATE,
)

settings = get_settings()


class AdvisoryService:
    """AI-powered certification advisory service using LangChain."""

    def __init__(self):
        """Initialize with settings from environment."""
        self.llm = ChatOpenAI(
            api_key=settings.OPENAI_API_KEY,
            model=settings.OPENAI_MODEL,
            temperature=settings.OPENAI_TEMPERATURE,
            max_tokens=settings.OPENAI_MAX_TOKENS,
        )

        # Create output parser
        self.output_parser = PydanticOutputParser(pydantic_object=AdvisoryOutput)

        # Create prompt template
        self.prompt = ChatPromptTemplate.from_messages([
            ("system", ADVISORY_SYSTEM_PROMPT),
            ("human", ADVISORY_USER_TEMPLATE),
        ]).partial(format_instructions=self.output_parser.get_format_instructions())

        # Create chain
        self.chain = self.prompt | self.llm | self.output_parser

    async def get_recommendations(
        self,
        request: AdvisoryRequest,
    ) -> AdvisoryOutput:
        """
        Get certification recommendations with structured output.
        
        Args:
            request: Advisory request with skills and certifications
            
        Returns:
            Structured advisory output
        """
        # Compress input to minimize tokens
        skills_str = ", ".join(request.skills[:20])  # Cap at 20 skills
        certs_str = ", ".join(request.current_certifications[:10]) or "None"

        result = await self.chain.ainvoke({
            "skills": skills_str,
            "current_certifications": certs_str,
        })
        return result

    async def get_recommendations_with_fallback(
        self,
        request: AdvisoryRequest,
    ) -> AdvisoryOutput:
        """
        Graceful degradation if AI fails.
        
        Args:
            request: Advisory request
            
        Returns:
            Advisory output or fallback response
        """
        try:
            return await self.get_recommendations(request)
        except Exception as e:
            # Return safe fallback instead of crashing
            return AdvisoryOutput(
                recommendations=[],
                confidence="low",
                clarification_needed=(
                    f"AI service temporarily unavailable. Please try again later. "
                    f"Error: {str(e)[:100]}"
                ),
            )


# Singleton instance
_advisory_service: AdvisoryService | None = None


def get_advisory_service() -> AdvisoryService:
    """Factory for advisory service dependency."""
    global _advisory_service
    if _advisory_service is None:
        _advisory_service = AdvisoryService()
    return _advisory_service
