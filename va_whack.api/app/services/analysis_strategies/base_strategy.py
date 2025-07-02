# ==============================================================================
# This file defines the abstract base class for all game analysis strategies.
# It enforces a common interface using the Strategy Design Pattern.
# ==============================================================================
from abc import ABC, abstractmethod
from typing import Dict, Any

class AnalysisStrategy(ABC):
    @abstractmethod
    def analyze(self, session_data: Any) -> Dict[str, Any]:
        """
        Analyzes a session's data and returns a dictionary of calculated results.
        This method must be implemented by all concrete strategy classes.
        """
        pass
