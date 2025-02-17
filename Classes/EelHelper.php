<?php

namespace Carbon\Shiki;

use Carbon\Shiki\Service\ApiService;
use Neos\Eel\ProtectedContextAwareInterface;
use Neos\Flow\Annotations as Flow;

class EelHelper implements ProtectedContextAwareInterface
{
    #[Flow\Inject]
    protected ApiService $apiService;

    /**
     * @param string $code
     * @param string $lang
     * @param string|null $defaultTheme
     * @param string|null $darkTheme
     * @param string|null $url for debug
     * @return array
     */
    public function compile(
        ?string $code = null,
        ?string $lang = null,
        ?string $defaultTheme = null,
        ?string $themeDark = null,
        ?string $url = null
    ): array {
        if (!$code || !$lang) {
            return [];
        }
        return $this->apiService->compileShiki($code, $lang, $defaultTheme, $themeDark, $url);
    }

    /**
     * @param string $methodName
     * @return bool
     */
    public function allowsCallOfMethod($methodName)
    {
        return true;
    }
}
