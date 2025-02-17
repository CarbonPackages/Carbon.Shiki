<?php

namespace Carbon\Shiki\Service;

use Neos\Flow\Exception;
use GuzzleHttp\Client;
use GuzzleHttp\RequestOptions;
use GuzzleHttp\Exception\ClientException;
use Neos\Flow\Annotations as Flow;
use Psr\Log\LoggerInterface;
use function sprintf;

#[Flow\Scope('singleton')]
class ApiService
{
    #[Flow\InjectConfiguration]
    protected array $configuration;

    #[Flow\Inject('Carbon.Shiki:ShikiLogger', false)]
    protected LoggerInterface $logger;

    /**
     * @param string $code
     * @param string $lang
     * @param string|null $defaultTheme
     * @param string|null $darkTheme
     * @param string|null $url for debug
     * @return array
     * @throws Exception
     */
    public function compileShiki(
        string $code,
        string $lang,
        ?string $defaultTheme = null,
        ?string $themeDark = null,
        ?string $url = null
    ): array {
        $client = new Client();
        $endpoint = $this->configuration['apiEndpoint'];
        if (!$defaultTheme) {
            $defaultTheme = $this->configuration['theme']['default'];
        }
        if (!$themeDark) {
            $themeDark = $this->configuration['theme']['dark'];
        }

        $result = [];

        try {
            $response = $client->request('POST', $endpoint, [
                RequestOptions::HEADERS => [
                    'Content-Type' => 'application/json; charset=utf-8',
                ],
                RequestOptions::JSON => [
                    'code' => $code,
                    'lang' => $lang,
                    'theme' => $defaultTheme,
                    'themeDark' => $themeDark,
                ],
            ]);
            $result = json_decode($response->getBody(), true);
        } catch (ClientException $exception) {
            $message = $exception->getResponse()->getBody()->getContents();
            $logMessage = 'Calling Shiki API ';
            if (isset($url)) {
                $logMessage .= sprintf('(%s) ', $url);
            }
            $logMessage .= sprintf('failed with reason: %s', $message);
            $this->logger->error($logMessage);
            throw new Exception($message, 1739716971);
        }

        $logMessage = 'Successfully called Shiki API';
        if (isset($url)) {
            $logMessage .= sprintf(' (%s)', $url);
        }

        $this->logger->debug($logMessage);
        return $result;
    }
}
